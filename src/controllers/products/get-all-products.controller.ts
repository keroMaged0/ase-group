import { RequestHandler } from 'express';

import { PaginationResponse } from '../../types/responses';
import { dataSource } from '../../config/typeorm';
import { Product } from '../../models/product.model';
import { FindOptionsWhere, ILike } from 'typeorm';
import { selectCreatedByJoinFields, selectUserProfileJoinFields } from '../../constants/query';
import { env } from 'process';
import { DurationType } from '../../models/vacation.model';

export const getAllProductsHandler: RequestHandler<unknown, PaginationResponse> = async (
  req,
  res,
  next,
) => {
  const productsCount = await dataSource
    .getRepository(Product)
    .count({ where: req.pagination.filter });

  const products = await dataSource
    .getRepository(Product)
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.medicine_category_id', 'medicine_category_id')
    .leftJoinAndSelect('product.created_by', 'createdBy')
    .leftJoinAndSelect('createdBy.user_company_profile', 'user_company_profile')
    .leftJoinAndSelect('createdBy.user_pharmacy_profile', 'user_pharmacy_profile')
    .leftJoinAndSelect('createdBy.user_doctor_profile', 'user_doctor_profile')
    .select([
      'product',
      'medicine_category_id',
      ...selectCreatedByJoinFields('createdBy'),
      ...selectUserProfileJoinFields('user_company_profile'),
      ...selectUserProfileJoinFields('user_pharmacy_profile'),
      ...selectUserProfileJoinFields('user_doctor_profile'),
    ])
    .where('createdBy.account_provider_id = :providerId ', {
      providerId: req.loggedUser.provider_id,
    })
    .andWhere('product.is_deleted = false')
    .andWhere(req.pagination.filter)
    .take(req.pagination.limit)
    .skip(req.pagination.skip)
    .getMany();

  products.forEach((p: any) => {
    if (p.created_by.user_company_profile === null) p.created_by.user_company_profile = undefined;
    if (p.created_by.user_pharmacy_profile === null) p.created_by.user_pharmacy_profile = undefined;
    if (p.created_by.user_doctor_profile === null) p.created_by.user_doctor_profile = undefined;
    if (p.created_by.user_company_profile?.profile_image != undefined)
      p.created_by.user_company_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${p.created_by.user_company_profile.profile_image}`;
    if (p.created_by.user_pharmacy_profile?.profile_image != undefined)
      p.created_by.user_pharmacy_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${p.created_by.user_pharmacy_profile.profile_image}`;
    if (p.created_by.user_doctor_profile?.profile_image != undefined)
      p.created_by.user_doctor_profile.profile_image = `${env.apiUrl}/api/v1/attachments?filePath=${p.created_by.user_doctor_profile.profile_image}`;
    p.duration_type = DurationType[p.duration_type];
    delete p.quantity;
  });

  return res.json({
    success: true,
    message: 'Product fetched successfully',
    pagination: {
      currentPage: req.pagination.page,
      totalPages: Math.ceil(productsCount / req.pagination.limit),
      resultCount: productsCount,
    },
    data: products,
  });
};

export const getPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    name?: string;
    price?: number;
    scientific_name?: string;
    caliber?: string;
  }
> = async (req, res, next) => {
  req.pagination = req.pagination || {};
  const filter: FindOptionsWhere<Product> = req.pagination.filter;

  if (req.query.name) filter.name = ILike(`%${req.query.name}%`);
  if (req.query.price) {
    const price = Number(req.query.price);
    if (!isNaN(price)) {
      filter.price = price;
    } else {
      return res.status(400).json({ error: 'Invalid price value' });
    }
  }
  if (req.query.scientific_name) filter.scientific_name = ILike(`%${req.query.scientific_name}%`);
  if (req.query.caliber) filter.caliber = ILike(`%${req.query.caliber}%`);
  req.pagination.filter = filter;
  next();
};
