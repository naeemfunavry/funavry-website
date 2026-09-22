import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";

import { authConfig } from "src/config/configuration";
import { RefreshTokenEntity, UserEntity } from "src/database/entities";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
    PassportModule.register({ defaultStrategy: "jwt", session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authConfig)],
      inject: [authConfig.KEY],
      useFactory: (config: ConfigType<typeof authConfig>) => ({
        secret: config.accessSecret,
        signOptions: {
          /* See the JwtExpiry note in token.service.ts. */
          expiresIn: config.accessExpiresIn as never,
          issuer: config.issuer,
          audience: config.audience,
          /* Pinned. Without it a token could be presented with `alg: none`, or
             an RS256 public key could be replayed as an HMAC secret — both are
             classic JWT verification bypasses. */
          algorithm: "HS256",
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService, JwtStrategy],
  exports: [AuthService, PasswordService, TokenService],
})
export class AuthModule {}
