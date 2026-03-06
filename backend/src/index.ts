import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ message: 'pong' });
});

// Identify endpoint - Phase 3 Complex Consolidation Logic
app.post('/identify', async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber } = req.body;
        const phoneStr = phoneNumber ? String(phoneNumber) : null;

        // Validate request
        if (!email && !phoneStr) {
            return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
        }

        // Find all matching contacts containing either the email or phone number
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
                    primaryContatctId: newContact.id,
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

        // 3. Check for new information that requires a New Secondary Contact
        // E.g., The incoming request has a new email paired with an existing phone, or vice-versa.
        const matchEmails = matchingContacts.map(c => c.email).filter(Boolean);
        const matchPhones = matchingContacts.map(c => c.phoneNumber).filter(Boolean);

        const isNewEmail = email && !matchEmails.includes(email);
        const isNewPhone = phoneStr && !matchPhones.includes(phoneStr);

        if (isNewEmail || isNewPhone) {
            await prisma.contact.create({
                data: {
                    email: email || null,
                    phoneNumber: phoneStr || null,
                    linkPrecedence: 'secondary',
                    linkedId: oldestPrimary.id
                }
            });
        }

        // 4. Construct Final Response Payload
        // Re-fetch the entire consolidated cluster for the oldest primary
        const clusterContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: oldestPrimary.id },
                    { linkedId: oldestPrimary.id }
                ]
            },
            orderBy: { createdAt: 'asc' } // Oldest first ensures primary email/phone leads the arrays
        });

        // Collect unique values, maintaining order (Primary's info appears first naturally)
        const emailsSet = new Set<string>();
        const phonesSet = new Set<string>();
        const secondaryIds: number[] = [];

        for (const contact of clusterContacts) {
            if (contact.email) emailsSet.add(contact.email);
            if (contact.phoneNumber) phonesSet.add(contact.phoneNumber);
            if (contact.id !== oldestPrimary.id) {
                secondaryIds.push(contact.id);
            }
        }

        return res.status(200).json({
            contact: {
                primaryContatctId: oldestPrimary.id,
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
