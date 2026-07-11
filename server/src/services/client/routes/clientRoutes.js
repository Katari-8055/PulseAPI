import express from "express";
import clientDependencies from "../Dependencies/dependencies.js"
import authenticate from "../../../shared/middlewares/authenticate.js"

// Create a new router instance
const router = express.Router();

// Destructure the clientController from the dependencies
const { clientController } = clientDependencies.controller


// Onboard a new client
router.post("/clients/register", (req, res, next) => clientController.createClient(req, res, next))


//Login Client
router.post("/clients/login", (req, res, next) => clientController.loginClient(req, res, next))


// Create a user for a client
router.post("/clients/:clientId/users", (req, res, next) => clientController.createClientUser(req, res, next))

// Create API key for a client
router.post("/clients/:clientId/api/keys", (req, res, next) => clientController.createApiKey(req, res, next))

// Get all API keys for a client
router.get("/clients/:clientId/api/keys", (req, res, next) => clientController.getClientApiKeys(req, res, next))

export default router;