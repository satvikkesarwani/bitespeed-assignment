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

// Identify endpoint - Phase 2 Core Logic
app.post('/identify', async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber } = req.body;

        // Validate request
        if (!email && !phoneNumber) {
            return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
        }

        // Find all matching contacts
        const matchingContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { email: email || undefined },
                    { phoneNumber: phoneNumber ? String(phoneNumber) : undefined }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        // Strategy for Phase 2: If NO matches found, we create a NEW Primary contact
        if (matchingContacts.length === 0) {
            const newContact = await prisma.contact.create({
                data: {
                    email: email || null,
                    phoneNumber: phoneNumber ? String(phoneNumber) : null,
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

        // Phase 2 Strategy: If we found exactly matches, check if we need to return
        // To simplify for Phase 2 before Phase 3 complexity, if the info already exists
        // we just collect the unified info from all matching rows (assuming they belong to the same primary)
        // We find the primary contact of this cluster

        // Find all primary IDs associated with the current matches
        const primaryIds = new Set<number>();
        for (const contact of matchingContacts) {
            if (contact.linkPrecedence === 'primary') {
                primaryIds.add(contact.id);
            } else if (contact.linkedId) {
                primaryIds.add(contact.linkedId);
            }
        }

        // Get the oldest primary ID (the ultimate primary)
        const primaryIdArray = Array.from(primaryIds).sort((a, b) => a - b);
        const ultimatePrimaryId = primaryIdArray[0];

        // Fetch the WHOLE cluster linked to this ultimate primary
        const clusterContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: ultimatePrimaryId },
                    { linkedId: ultimatePrimaryId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        // Formatting response
        const emails = Array.from(new Set(clusterContacts.map(c => c.email).filter(Boolean))) as string[];
        const phoneNumbers = Array.from(new Set(clusterContacts.map(c => c.phoneNumber).filter(Boolean))) as string[];
        const secondaryIds = clusterContacts.filter(c => c.id !== ultimatePrimaryId).map(c => c.id);

        return res.status(200).json({
            contact: {
                primaryContatctId: ultimatePrimaryId,
                emails,
                phoneNumbers,
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
