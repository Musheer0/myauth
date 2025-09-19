import { $Enums, PrismaClient } from "@prisma/client";
import crypto from "crypto";
import {hash,verify} from 'argon2'
export function generateOtp() {
  const num = crypto.randomInt(0, 1_000_000); 
  return num.toString().padStart(6, "0"); // "042371"
}
export const GetUserByEmail = (client:PrismaClient,email:string,options:{strict:boolean})=>{
    return options.strict ? client.user.findFirst({
        where:{
            email,
            is_banned:false,
        }
    })
    :
     client.user.findFirst({
        where:{
            email,
        }
    })
}

export const GetUserById = (client:PrismaClient,id:string,options?:{strict:boolean})=>{
    return options?.strict ? client.user.findFirst({
        where:{
            id,
            is_banned:false,
        }
    })
    :
     client.user.findFirst({
        where:{
             id,
        }
    })
}
export const GetVerificationTokenById= (client:PrismaClient,id:string,options?:{})=>{
    return  client.verification_token.findFirst({
        where:{
            id,
            expires_at:{gt:new Date()}
        }
    })
}

export const GetVerificationTokenByIdScope= (client:PrismaClient,id:string,scope:$Enums.SCOPE, options?:{})=>{
    return  client.verification_token.findFirst({
        where:{
            id,
            expires_at:{gt:new Date()},
            scope
        }
    })
}
export const CreateVerificationToken=async (client:PrismaClient, options:{user_id:string,scope:$Enums.SCOPE,expires_at?:Date})=>{
    const opt = generateOtp();
    const hashed_otp = await hash(opt);
    const v_token = await client.verification_token.create({
        data:{
            user_id:options.user_id,
            scope:options.scope,
            code:hashed_otp,
            expires_at:options.expires_at|| new Date(),
        }
    });
    return {
        opt,verification_token:v_token
    }
}

export const VerifyToken = async (
  client: PrismaClient,
  options: { id: string; code: string; scope: $Enums.SCOPE }
): Promise<{ error: string } | { success: boolean }> => {
  const token = await client.verification_token.findUnique({
    where: { id: options.id },
  });

  if (!token) {
    return { error: "Token not found" };
  }

  if (token.scope !== options.scope) {
    return { error: "Invalid scope" };
  }

  if (token.expires_at && token.expires_at < new Date()) {
    return { error: "Token expired" };
  }

  const valid = await verify(token.code!, options.code);
  if (!valid) {
    return { error: "Invalid code" };
  }

  return { success: true };
};