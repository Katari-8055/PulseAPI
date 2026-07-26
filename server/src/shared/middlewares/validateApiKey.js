import ResponseFormatter from '../utils/responseFormatter.js';
import logger from '../config/logger.js';
import clientContainer from '../../services/client/Dependencies/dependencies.js';
import apiKeyCache from '../cache/lrucache.js';

/**
 * Middleware to validate API keys against database (with LRU cache).
 * Used for external services posting events via the ingest route.
 *
 * Cache behaviour:
 *  - HIT  → no DB call; validate directly from cached { client, apiKey } POJO
 *  - MISS → DB query via getClientByApiKey() → result stored in cache (TTL: 10 min)
 *
 * Cache invalidation:
 *  - When a client is deactivated, the cache entry is evicted so the next
 *    request re-fetches from DB and fails correctly.
 *  - Keys with no ingest permission are KEPT in cache (permission is a stable
 *    DB state; there is no point re-querying on every request).
 *
 * To manually invalidate from another module (e.g. key revocation endpoint):
 *   import apiKeyCache from '../cache/lrucache.js';
 *   apiKeyCache.delete(rawKeyValue);
 */
const validateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            logger.warn('API request without API key', {
                path: req.path,
                ip: req.ip,
            });
            return res
                .status(401)
                .json(ResponseFormatter.error('API key is required', 401));
        }

        // ── Cache lookup ───────────────────────────────────────────────────────
        let result = apiKeyCache.get(apiKey);

        if (!result) {
            // ── Cache MISS → query DB ──────────────────────────────────────────
            result = await clientContainer.services.clientServices.getClientByApiKey(apiKey);

            if (!result) {
                logger.warn('Invalid API key attempted', {
                    path: req.path,
                    ip: req.ip,
                    apiKey: apiKey.substring(0, 8) + '...', // partial key for security
                });
                return res
                    .status(403)
                    .json(ResponseFormatter.error('Invalid API key', 403));
            }

            // Store valid result in cache for future requests
            apiKeyCache.set(apiKey, result);
        }

        const { client, apiKey: apiKeyObj } = result;

        // Check if client is active.
        // Evict from cache so the next request re-fetches from DB in case the
        // account is reactivated later.
        if (!client.isActive) {
            apiKeyCache.delete(apiKey);

            logger.warn('Inactive client attempted API access', {
                path: req.path,
                ip: req.ip,
                clientId: client._id,
            });
            return res
                .status(403)
                .json(ResponseFormatter.error('Client account is inactive', 403));
        }

        // Check API key ingest permission.
        // NOT evicted from cache: permission state is stable and the key is
        // still valid in the DB — re-querying would return the same result.
        if (!apiKeyObj.permissions?.canIngest) {
            logger.warn('API key without ingest permission attempted access', {
                path: req.path,
                ip: req.ip,
                apiKeyId: apiKeyObj._id,
            });
            return res
                .status(403)
                .json(ResponseFormatter.error('API key does not have ingest permissions', 403));
        }

        // Attach client and API key info to request
        req.client = client;
        req.apiKey = apiKeyObj;

        next();
    } catch (error) {
        logger.error('Error validating API key:', error);
        return res
            .status(500)
            .json(ResponseFormatter.error('Internal server error', 500));
    }
};

export default validateApiKey;