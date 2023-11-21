import { Response } from "express";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import { getCompanyPictureFromGoogle } from "../services/get-picture.services";

export async function getImage(
    req: RequestWithUser,
    res: Response
  ) {
    const url: string = req.query.picture as string;
    const imageBase64 = await getCompanyPictureFromGoogle(url);

    return res.status(200).send({ imageBase64 });
}