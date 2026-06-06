import AppError from "../../../shared/utils/AppError.js"
import config from "../../../shared/config/index.js"
import jwt from "jsonwebtoken"
import logger from "../../../shared/config/logger.js"

export class AuthService {
    constructor(userRepository) {
        if (!userRepository) {
            throw new Error("UserRepository is required")
        }
        this.userRepository = userRepository;
    };

    generateToken(user) {
        const {_id, email, username, role, clientId} = user;
        const payload = { userid: _id, email, username, role, clientId};

        return jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });
    }

    //removing passwornd when sending data as a response
    formateUserResponse(user) {
        const userObj = user.toObject ? user.toObject() : {...user};
        delete userObj.password;
        return userObj;
    }

    async onBoardSuperAdmin(superAdminData){
        try{
            const existingSuperAdmin = await this.userRepository.findAll();
            if (existingSuperAdmin.length > 0 && existingSuperAdmin){
                throw new AppError("Super admin Onboarding Disabled", 403);
            } 
            const user = await this.userRepository.create(superAdminData);

            const token = this.generateToken(user);
            logger.info("Super admin onboarded", { username: user.username });
            return { user: this.formateUserResponse(user), token }
        }catch(error){
            logger.error("Error occurred while onboarding super admin", { error });
            throw new AppError("Error occurred while onboarding super admin", 500);
        }
    }

    async register(userData) {
        try {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new AppError("User already exists with this email", 400);
            }

            const user = await this.userRepository.create(userData);
            logger.info("New user registered", { username: user.username, role: user.role });
            return this.formateUserResponse(user);
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error("Error in registration service", { error: error.message });
            throw new AppError("Failed to register user", 500);
        }
    }

    async login(username, password) {
        try {
            // userRepository needs to have findByUsername or findOne
            const user = await this.userRepository.model.findOne({ username });
            if (!user || !(await user.comparePassword(password))) {
                throw new AppError("Invalid username or password", 401);
            }

            if (!user.isActive) {
                throw new AppError("Your account is deactivated", 403);
            }

            const token = this.generateToken(user);
            logger.info("User logged in", { username: user.username });
            return { user: this.formateUserResponse(user), token };
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error("Error in login service", { error: error.message });
            throw new AppError("Login failed", 500);
        }
    }

    async getProfile(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError("User not found", 404);
            }
            return this.formateUserResponse(user);
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error("Error fetching user profile", { error: error.message });
            throw new AppError("Failed to fetch profile", 500);
        }
    }
}