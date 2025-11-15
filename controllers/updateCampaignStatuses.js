import poolManager from './utils/poolManager.js';

const updateCampaignStatuses = async (clientPool, clientId) => {
    let query = 'SELECT campaign_id, campaign_name FROM campaigns';
    try {
        const [rows] = await clientPool.query(query);
        console.log(`Campaigns for client ${clientId}:`, rows);
        return rows;
    }
    catch (error) {
        console.error(`Error fetching campaigns for client ${clientId}:`, error);
        throw error;
    }
}


export default updateCampaignStatuses;



