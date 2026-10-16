import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            createdAt: Date;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        accessToken: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        expiresIn: string;
    }>;
    getProfile(req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
