import 'dotenv/config';
import insiightPool from './config/insiightCommonPool.js';
import {getClientPool} from './config/poolManager.js';
import updateCampaignStatuses from './controllers/updateCampaignStatuses.js';
import sgMail from '@sendgrid/mail';

const getInsiightClientNames = async () => {
    let query = 'SELECT client_id, db_name, client_name FROM sm_clients_info';
    try {
        const [rows] = await insiightPool.query(query);
        return rows;
    }
    catch (error) {
        console.error('Error fetching client names:', error);
        throw error;
    }
    finally {
        await insiightPool.end();
    }

};

const main = async () => {
    let statusChanges = {}
    try {
        const clients = await getInsiightClientNames();
        for (const client of clients) {
            console.log(`Processing client: ${client.client_name} (${client.client_id})`);
            const clientPool = getClientPool(client.client_id);
            let campaignsStatusChanged = await updateCampaignStatuses(clientPool, client.client_id);
            if (campaignsStatusChanged){
                statusChanges[client.client_id] = campaignsStatusChanged;
                console.log(`Client: ${client.client_name} (${client.client_id}) - Campaigns Status Changed:`, campaignsStatusChanged);
            }
            if (Object.keys(statusChanges).length > 0) {
                sendEmailNotification(statusChanges);
            }
        }
    } catch (error) {
        console.error('Error in main execution:', error);
    }
};

const sendEmailNotification = async (statusChanges) => {
    if (Object.keys(statusChanges).length === 0) {
        console.log('No campaign status changes to report.');
        return;
    }

    // Initialize SendGrid with API key from environment variable
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Format the status changes into a readable HTML email
    let emailBody = '<h2>Campaign Status Changes Report</h2>';
    for (const [clientId, campaigns] of Object.entries(statusChanges)) {
        emailBody += `<h3>Client ID: ${clientId}</h3><ul>`;
        campaigns.forEach(campaign => {
            emailBody += `<li><strong>${campaign.campaign_name}</strong> (ID: ${campaign.campaign_id}): ${campaign.old_status} → ${campaign.new_status}</li>`;
        });
        emailBody += '</ul>';
    }

    const msg = {
        to: ['sean.wharton@insiightanalytics.com', 'parakram.vishwakarma@insiightanalytics.com'],
        from: process.env.SENDGRID_FROM_EMAIL, // Use verified sender email
        subject: 'Campaign Status Changes Alert',
        html: emailBody,
    };

    try {
        await sgMail.send(msg);
        console.log('Email notification sent successfully');
    } catch (error) {
        console.error('Error sending email notification:', error);
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
    }
}





main();