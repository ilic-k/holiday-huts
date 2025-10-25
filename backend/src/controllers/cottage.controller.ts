import { NextFunction, RequestHandler, Request, Response } from "express";
import Cottage from "../models/Cottage";
import User from "../models/User";
import Reservation from "../models/Reservation";

export class CottageController {
    getStats: RequestHandler = async (req, res, next) => {
        try {
            const totalCottages = await Cottage.countDocuments();
            const totalOwners = await User.countDocuments({ role: 'vlasnik', approved: true });
            const totalTourists = await User.countDocuments({ role: 'turista', approved: true });

            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const reservations24h = await Reservation.countDocuments({
                createdAt: { $gte: oneDayAgo }
            });
            const reservations7d = await Reservation.countDocuments({
                createdAt: { $gte: sevenDaysAgo }
            });
            const reservations30d = await Reservation.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            res.status(200).json({
                message: "Statistika uspešno dobijena",
                stats: {
                    totalCottages,
                    totalOwners,
                    totalTourists,
                    reservations24h,
                    reservations7d,
                    reservations30d
                }
            });
        } catch (error) {
            next(error);
        }
    };

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
                title: 'title', '-title': '-title',
                place: 'place', '-place': '-place'
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