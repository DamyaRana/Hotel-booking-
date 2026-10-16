import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
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
    getProfile(userId: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    adminLogin(dto: LoginDto): Promise<{
        message: string;
        accessToken: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: "ADMIN";
        };
        expiresIn: string;
    }>;
}
