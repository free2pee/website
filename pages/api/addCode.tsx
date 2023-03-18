import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const CSV_FILE_PATH = path.join(process.cwd(), 'codes.csv');

export default async function addCode(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Invalid Request Method' });
        return;
    }

    if (!req.body.selectedBathroomId || !req.body.bathroomCode) {
        res.status(400).json({ message: 'Insufficient Data Provided' });
        return;
    }

    try {
        // Append or create the CSV file with the bathroom code
        const csvData = `${req.body.selectedBathroomId},${req.body.bathroomCode}\n`;
        fs.appendFileSync(CSV_FILE_PATH, csvData);

        // Send the POST request to OpenStreetMap API to update bathroom metadata

        // const osmToken = req.body.osmOAuthToken; // Extract this token from the request headers or body
        // const response = await axios.put(
        //     `https://api.openstreetmap.org/api/0.6/[node|way|relation]/${req.body.selectedBathroomId}`, // This URL depends on the type of element you are editing on OSM
        //     {
        //         // Your bathroom metadata
        //         // This would likely be in XML format as per the HTTP protocol for OSM
        //     },
        //     {
        //         headers: { 'Authorization': `Bearer ${osmToken}` }
        //     }
        // );

        // res.status(response.status).json({ message: 'Code saved and metadata updated.' });
    } catch (error) {
        console.log(error);
        // res.status(500).json({ message: 'An error occurred while processing the request.', error });
    }
}