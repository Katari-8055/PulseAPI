import { APPLICATION_ROLES } from "../../../shared/constant/role.js";
import config from "../../../shared/config/index.js"
import ResponseFormatter from "../../../shared/utils/responseFormatter.js";

export class AuthController {
    constructor(authService) {
        if(!authService){
            throw new Error("AuthService is required")
        }

        this.authService = authService;
    };

    async onBoardSuperAdmin(req, res, next){
        try{
            const {username, email, password} = req.body;
            const superAdminData = { username, email, password, role: APPLICATION_ROLES.SUPER_ADMIN};

            const {token, user} = await this.authService.onBoardSuperAdmin(superAdminData);
            res.cookie("authToken", token, {
                httpOnly: config.cookies.httpOnly,
                secure: config.cookies.secure,
                maxAge: config.cookies.expiresIn
            })

            res.status(201).json(ResponseFormatter.success(user, "Super admin onboarded successfully", 201))
        }catch(error){
            next(error);
        }
    } 

    async register(req, res, next) {
        try {
            const user = await this.authService.register(req.body);
            res.status(201).json(ResponseFormatter.success(user, "User registered successfully", 201));
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const { token, user } = await this.authService.login(username, password);

            res.cookie("authToken", token, {
                httpOnly: config.cookies.httpOnly,
                secure: config.cookies.secure,
                maxAge: config.cookies.expiresIn
            });

            res.status(200).json(ResponseFormatter.success(user, "Login successful", 200));
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const user = await this.authService.getProfile(req.user.userid);
            res.status(200).json(ResponseFormatter.success(user, "Profile fetched successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            res.clearCookie("authToken");
            res.status(200).json(ResponseFormatter.success(null, "Logout successful", 200));
        } catch (error) {
            next(error);
        }
    }
}