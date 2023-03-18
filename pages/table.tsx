import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, Grid, Box } from '@mui/material';
import { SaveAlt as SaveIcon } from '@mui/icons-material';
import openingHours from 'opening_hours';

interface Bathroom {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name: string;
    [key: string]: string;
  };
}

type TableProps = {
  bathrooms: Bathroom[];
};

const MyTable: NextPage<TableProps> = ({ bathrooms }) => {
  const [bathroomCode, setBathroomCode] = useState<string>('');
  const [selectedBathroomId, setSelectedBathroomId] = useState<number | null>(null);

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBathroomCode(event.target.value);
  };

  const handleCodeSubmit = async () => {
    // Replace with the correct token
    const osmOAuthToken = 'your_osm_oauth_token';
  
    try {
      const response = await fetch('/api/addCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          osmOAuthToken,
          selectedBathroomId,
          bathroomCode
        }),
      });
  
      if (response.ok) {
        alert('Code saved and metadata updated.');
      } else {
        alert('There was an error saving the code.');
      }
    } catch (error) {
      console.error('An error occurred while submitting the code:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ backgroundColor: 'blue', color: 'white', padding: 1, borderRadius: '4px', marginBottom: '16px' }}>
        Nearest Bathrooms
      </Typography>

      <TableContainer component={Paper} sx={{ backgroundColor: 'red', boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: 'blue', color: 'white', fontWeight: 'bold'}}>ID</TableCell>
              <TableCell sx={{ backgroundColor: 'blue', color: 'white', fontWeight: 'bold'}}>Name</TableCell>
              <TableCell sx={{ backgroundColor: 'blue', color: 'white', fontWeight: 'bold'}}>Latitude</TableCell>
              <TableCell sx={{ backgroundColor: 'blue', color: 'white', fontWeight: 'bold'}}>Longitude</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bathrooms.map((bathroom) => (
              <TableRow key={bathroom.id}>
                <TableCell>{bathroom.id}</TableCell>
                <TableCell>{bathroom.tags.name || 'N/A'}</TableCell>
                <TableCell>{bathroom.lat}</TableCell>
                <TableCell>{bathroom.lon}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6" gutterBottom>
          Submit a Bathroom Code
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={3}>
            <TextField
              label="Bathroom ID"
              value={selectedBathroomId === null ? '' : selectedBathroomId}
              onChange={(e) => setSelectedBathroomId(Number(e.target.value))}
              InputLabelProps={{ style: { fontSize: 14 } }}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Bathroom Code"
              value={bathroomCode}
              onChange={handleCodeChange}
              InputLabelProps={{ style: { fontSize: 14 } }}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCodeSubmit}
              startIcon={<SaveIcon />}
              fullWidth
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default MyTable;

export const getServerSideProps: GetServerSideProps<TableProps> = async (context) => {
  const latitude = context.query.latitude;
  const longitude = context.query.longitude;

  if (typeof latitude !== 'string' || typeof longitude !== 'string') {
    return { notFound: true };
  }

  const fetchNearestBathrooms = async (): Promise<Bathroom[]> => {
    const overpassApiUrl = `https://overpass.kumi.systems/api/interpreter?data=[out:json];node[amenity=toilets](around:1000,${latitude},${longitude});out;`;

    const response = await fetch(overpassApiUrl);
    const data = await response.json();
    return data.elements;
  };

  const bathrooms = await fetchNearestBathrooms();

  return {
    props: { bathrooms },
  };
};
