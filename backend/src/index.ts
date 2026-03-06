import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Helper to sanitize phone numbers
const normalizePhone = (phone: string | null): string | null => {
    if (!phone) return null;
    // Strip all non-numeric characters
    return phone.replace(/\D/g, '');
};

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: { error: 'Too many requests from this IP, please try again later.' }
});

app.use(limiter);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ message: 'pong' });
});

// Identify endpoint - Phase 3 Complex Consolidation Logic
app.post('/identify', async (req: Request, res: Response) => {
    console.log("[BACKEND] >>> /identify request received");
    console.log("[BACKEND] Headers:", JSON.stringify(req.headers, null, 2));
    console.log("[BACKEND] Body:", JSON.stringify(req.body, null, 2));

    try {
        const { email, phoneNumber } = req.body;

        // Normalize input
        const rawPhone = (phoneNumber !== undefined && phoneNumber !== null) ? String(phoneNumber) : null;
        const phoneDigits = rawPhone ? rawPhone.replace(/\D/g, '') : null;

        // Strict Backend Validation Guard
        if (rawPhone && rawPhone.length > 0 && (!/^\d+$/.test(phoneDigits!) || phoneDigits!.length < 1)) {
            return res.status(400).json({ error: 'Invalid phone number format. Numbers only are allowed.' });
        }

        const phoneStr = phoneDigits;

        // Validate request strictly
        if (!email && !phoneStr) {
            return res.status(400).json({ error: 'Either email or a valid numeric phoneNumber must be provided in the payload' });
        }

        // Gmail restriction
        if (email && !email.toLowerCase().endsWith('@gmail.com')) {
            return res.status(400).json({ error: 'Only @gmail.com addresses are allowed' });
        }

        // Find all matching contacts -- since we normalize on storage, we can search by exact normalized string
        const matchingContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { email: email || undefined },
                    { phoneNumber: phoneStr || undefined }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        // If NO matches are found, we create a completely NEW Primary contact
        if (matchingContacts.length === 0) {
            const newContact = await prisma.contact.create({
                data: {
                    email: email || null,
                    phoneNumber: phoneStr || null,
                    linkPrecedence: 'primary'
                }
            });

            return res.status(200).json({
                contact: {
                    primaryContactId: newContact.id,
                    emails: newContact.email ? [newContact.email] : [],
                    phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
                    secondaryContactIds: []
                }
            });
        }

        // --- Core Consolidation Logic --- 

        // 1. Identify all primary contacts connected to the matches
        const primaryIdsSet = new Set<number>();
        for (const contact of matchingContacts) {
            if (contact.linkPrecedence === 'primary') {
                primaryIdsSet.add(contact.id);
            } else if (contact.linkedId) {
                primaryIdsSet.add(contact.linkedId);
            }
        }

        // Fetch all those primary records to sort them by date and find the oldest
        const primaryContacts = await prisma.contact.findMany({
            where: { id: { in: Array.from(primaryIdsSet) } },
            orderBy: { createdAt: 'asc' }
        });

        const oldestPrimary = primaryContacts[0];
        const newerPrimaries = primaryContacts.slice(1);

        // 2. Transform newer primaries (and their linked secondaries) into secondaries of the oldest primary
        if (newerPrimaries.length > 0) {
            for (const p of newerPrimaries) {
                // Change the newer primary itself into a secondary
                await prisma.contact.update({
                    where: { id: p.id },
                    data: {
                        linkPrecedence: 'secondary',
                        linkedId: oldestPrimary.id,
                        updatedAt: new Date()
                    }
                });

                // Update any secondaries that were previously pointing to this newer primary
                await prisma.contact.updateMany({
                    where: { linkedId: p.id },
                    data: {
                        linkedId: oldestPrimary.id,
                        updatedAt: new Date()
                    }
                });
            }
        }

        // 3. Fetch the entire consolidated cluster for the oldest primary to verify duplicates
        const clusterContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: oldestPrimary.id },
                    { linkedId: oldestPrimary.id }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        const clusterEmails = new Set(clusterContacts.map(c => c.email).filter(Boolean));
        const clusterPhones = new Set(clusterContacts.map(c => c.phoneNumber).filter(Boolean));

        // 4. Check for new information that requires a New Secondary Contact
        // Validate against the ENTIRE cluster, not just the original search matches.
        const isNewEmail = email && !clusterEmails.has(email);
        const isNewPhone = phoneStr && !clusterPhones.has(phoneStr);

        if (isNewEmail || isNewPhone) {
            const addedSecondary = await prisma.contact.create({
                data: {
                    email: email || null,
                    phoneNumber: phoneStr || null,
                    linkPrecedence: 'secondary',
                    linkedId: oldestPrimary.id
                }
            });
            clusterContacts.push(addedSecondary);
        }

        // 5. Construct Final Response Payload
        // Collect unique values, ensuring the primary contact's info is FIRST
        const emailsSet = new Set<string>();
        const phonesSet = new Set<string>();
        const secondaryIds: number[] = [];

        // Add primary info first as per spec
        if (oldestPrimary.email) emailsSet.add(oldestPrimary.email);
        if (oldestPrimary.phoneNumber) phonesSet.add(oldestPrimary.phoneNumber);

        for (const contact of clusterContacts) {
            if (contact.email) emailsSet.add(contact.email);
            if (contact.phoneNumber) phonesSet.add(contact.phoneNumber);
            if (contact.id !== oldestPrimary.id) {
                secondaryIds.push(contact.id);
            }
        }

        return res.status(200).json({
            contact: {
                primaryContactId: oldestPrimary.id,
                emails: Array.from(emailsSet),
                phoneNumbers: Array.from(phonesSet),
                secondaryContactIds: secondaryIds
            }
        });

    } catch (error) {
        console.error('Error in /identify:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
