import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwtConstants } from "./jwt.secret";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        })
    }

    async validate(payload: any) {
        return {
            id_user: payload.id_user,
            username: payload.username,
            full_name: payload.full_name,
            email: payload.email,
            phone: payload.phone,
            whatsapp: payload.whatsapp,
            notes: payload.notes,
        };
    }
}