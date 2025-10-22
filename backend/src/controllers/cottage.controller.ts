import { NextFunction, RequestHandler, Request, Response } from "express";
import Cottage from "../models/Cottage";

export class CottageController {
    getAll: RequestHandler = async (req, res, next) => {
        try {
            const {
                q, place, sort
            } = req.query as any;

            const filter: any = {};

            if (q) {
                filter.title = { $regex: q, $options: 'i' };
            }
            if (place) {
                filter.place = { $regex: place, $options: 'i' };
            }

            const sortMap: any = {
                price: 'pricing.winter', '-price': '-pricing.winter',
                rating: 'ratingAvg', '-rating': '-ratingAvg',
            }

            const data = await Cottage.find(filter)
            .sort(sortMap[sort] || '-createdAt')
            .select('title place pricing ratingAvg images');

            res.status(200).json({ message: "Uspešno dobijene vikendice", cottages: data });
        } catch (error) {
            next(error);
        }
    };

    getOne: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await Cottage.findById(req.params.id)
            if (!data) {
                res.status(404).json({ message: 'Vikendica nije pronađena' });
                return;
            }
            res.status(200).json({ message: "Uspešno dobijena vikendica", cottage: data });
        } catch (error) {
            next(error);
        }
    };
}