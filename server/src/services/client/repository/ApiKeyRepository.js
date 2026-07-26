import logger from "../../../shared/config/logger.js";
import ApiKey from "../../../shared/models/ApiKey.js"
import BaseApiKeyRepository from "./BaseApiKeyRepository.js"

/**
 * MongoApiKeyRepository class to handle database operations related to API keys
 * This class extends the BaseApiKeyRepository and provides implementations for creating API keys, finding API keys by value, and finding/counting API keys by client ID. It uses Mongoose for database interactions and includes error handling and logging for each operation.
 */
class MongoApiKeyRepository extends BaseApiKeyRepository {
    constructor() {
        super(ApiKey)
    }

    /**
     * Create a new API key
     * @param {Object} apiKeyData - API key data
     * @returns {Promise<Object>}
     */
    async create(apiKeyData) {
        try {
            const apiKey = new this.model(apiKeyData);
            await apiKey.save();
            logger.info('API key created in database', { keyId: apiKey.keyId });
            return apiKey;
        } catch (error) {
            logger.error('Error creating API key in database:', error);
            throw error;
        }
    }

    /**
     * Find API key by key value — optimised for the auth hot path.
     *
     * Optimisations applied:
     *  1. `.lean()` — returns a plain JS object instead of a full Mongoose
     *     document. Skips hydration, virtuals, and prototype setup.
     *     ~2-5× faster for read-only lookups. Safe here because the caller
     *     only reads the result; it never calls `.save()` or Mongoose methods.
     *
     *  2. `.select()` — fetches only the fields the auth middleware actually
     *     needs. Omits `metadata`, `security.allowedIPs`, `security.allowedOrigins`,
     *     `security.rotationWarningDays`, `description`, `createdBy` etc.,
     *     which reduces document size and wire transfer from MongoDB.
     *
     *  3. Selective `.populate()` — loads only `_id`, `name`, and `isActive`
     *     from the Client collection. Prevents fetching `password`, `description`,
     *     `website`, `settings`, and `slug` on every ingest request.
     *
     *  4. The compound index `{ keyValue: 1, isActive: 1 }` (defined in
     *     ApiKey.js) is used automatically by this query, giving O(log n)
     *     lookup without a collection scan.
     *
     * @param {string}  keyValue        - Raw API key string from request header
     * @param {boolean} includeInactive - If true, also matches inactive keys
     * @returns {Promise<Object|null>}  - Lean POJO or null
     */
    async findByKeyValue(keyValue, includeInactive = false) {
        try {
            const filter = { keyValue };
            if (!includeInactive) {
                filter.isActive = true;
            }

            const apiKey = await this.model
                .findOne(filter)
                // Only the fields the auth middleware inspects
                .select('keyValue clientId isActive permissions expiresAt')
                .populate({
                    path: 'clientId',
                    // Only the fields validateApiKey.js reads from `client`
                    select: '_id name isActive',
                })
                .lean();

            return apiKey;
        } catch (error) {
            logger.error('Error finding API key by value:', error);
            throw error;
        }
    }



    /**
     * Find API keys by client ID
     * @param {string} clientId - Client ID
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>}
     */
    async findByClientId(clientId, filters = {}) {
        try {
            const query = { clientId, ...filters };
            const apiKeys = await this.model.find(query)
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 });

            return apiKeys;
        } catch (error) {
            logger.error('Error finding API keys by client ID:', error);
            throw error;
        }
    }


    /**
     * Count API keys by client ID
     * @param {string} clientId - Client ID
     * @param {Object} filters - Additional filters
     * @returns {Promise<number>}
     */
    async countByClientId(clientId, filters = {}) {
        try {
            const query = { clientId, ...filters };
            const count = await this.model.countDocuments(query);
            return count;
        } catch (error) {
            logger.error('Error counting API keys:', error);
            throw error;
        }
    }
}

export default new MongoApiKeyRepository();