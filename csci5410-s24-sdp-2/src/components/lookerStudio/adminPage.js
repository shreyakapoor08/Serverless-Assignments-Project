import { Container, Typography, Divider } from '@mui/material';
import React from 'react';

const AdminPage = () => {
    return (
        <Container maxWidth="xl">
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center',  pt: '1em'}}>
            Admin Dashboard
            
            </Typography>
            <Divider sx={{ marginTop: 2 }} />
            <div>
                <iframe
                    width="95%"
                    height="500"
                    alignItems="center"
                    src="https://lookerstudio.google.com/embed/reporting/7f7d8791-d4b5-47ad-8155-d19dcfea9014/page/R6R6D"
                    frameBorder="0"
                    style={{ border: 0, margin: '0 auto' }}
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
                </iframe>
            </div>
        </Container>
    );
};

export default AdminPage;
