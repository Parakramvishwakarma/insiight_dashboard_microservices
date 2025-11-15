import { closeClientPool } from "../config/poolManager.js";

const updateCampaignStatuses = async (clientPool, clientId) => {
    let query = 'SELECT  * FROM sm_inventory_campaign_management WHERE status = "active" OR status = "scheduled"';

    try {
        const [rows] = await clientPool.query(query);
        console.log(`Campaigns for client ${clientId}:`, rows);
        return rows;
    }
    catch (error) {
        console.error(`Error fetching campaigns for client ${clientId}:`, error);
        throw error;
    }
    finally {
        closeClientPool(clientId);
    }
}


export default updateCampaignStatuses;



