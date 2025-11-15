import insiightPool from './config/insiightCommonPool.js';
import {getClientPool} from './config/poolManager.js';
import updateCampaignStatuses from './controllers/updateCampaignStatuses.js';

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

    // Implement email sending logic here using preferred email service
    console.log('Sending email notification for the following status changes:', statusChanges);
}





main();