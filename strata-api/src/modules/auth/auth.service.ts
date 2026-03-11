import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(data: RegisterDto) {
        const emailExists = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (emailExists)
            throw new ConflictException('This email is already being used');

        const usernameExists = await this.prisma.user.findUnique({
            where: { username: data.username },
        });

        if (usernameExists)
            throw new ConflictException('This username is already being used');

        const hashedPassword = await bcrypt.hash(data.password, 10);

        await this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });

        return { code: 201, message: 'User registered successfully' };
    }

    async login(data: LoginDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.identifier },
                    { username: data.identifier }
                ],
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            code: 200,
            access_token: this.generateToken(user.user_id, user.email),
            user: {
                user_id: user.user_id,
                photo: user.photo,
                email: user.email,
                username: user.username
            }
        };
    }

    private generateToken(userId: number, email: string) {
        const payload = { sub: userId, email };
        return this.jwtService.sign(payload);
    }
}
