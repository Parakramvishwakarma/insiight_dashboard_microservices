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
    const pool = getClientPool(parent_org_id);

};

const main = async () => {
    try {
        const clients = await getInsiightClientNames();
        for (const client of clients) {
            const clientPool = getClientPool(client.client_id);
            const campaignRows = await updateCampaignStatuses(clientPool, client.client_id);
            console.log(`Client: ${client.client_name}, Campaigns:`, campaignRows);
        }
        console.log('Insiight Clients:', );
    } catch (error) {
        console.error('Error in main execution:', error);
    }
};

main();