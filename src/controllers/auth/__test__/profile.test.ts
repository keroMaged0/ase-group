import path from 'path';
import supertest from 'supertest';
import { dataSource } from '../../../config/typeorm';
import { Role } from '../../../models/role.model';
import { UserAuth, UserType } from '../../../models/user-auth.model';
import { UserProfileCompany } from '../../../models/user-profile-company.model';
import { UserProfileDoctor } from '../../../models/user-profile-doctor.model';
import { UserProfilePharmacy } from '../../../models/user-profile-pharmacy.model';
import { app } from '../../../app';
import { SystemRoles } from '../../../types/system-roles';
import { Permission } from '../../../models/permission.model';
import { PERMISSIONS } from '../../../types/permissions';
import { RolePermission } from '../../../models/role_permissions.model';
import { Country } from '../../../models/country.model';
import { City } from '../../../models/city.model';
import { State } from '../../../models/state.model';

jest.mock('../../../config/s3', () => {
  return {
    awsS3: {
      saveBucketFiles: jest.fn().mockResolvedValue(undefined),
      removeBucketFiles: jest.fn().mockResolvedValue(undefined),
      getFiles: () => (req, res, next) => {},
    },
  };
});

const request = supertest(app);
let users;
let companyProfile, pharmacyProfile, doctorProfile;

beforeEach(async () => {
  const permissions = await dataSource
    .getRepository(Permission)
    .save({ key: PERMISSIONS.update_profile });
  const roles = await dataSource.getRepository(Role).save(
    Object.values(SystemRoles).map((role) => ({
      key: role,
    })),
  );
  await dataSource
    .getRepository(RolePermission)
    .save(
      roles.map((role) => ({ role_id: { id: role.id }, permission_key: { key: permissions.key } })),
    );

  companyProfile = await dataSource.getRepository(UserProfileCompany).save({});
  pharmacyProfile = await dataSource.getRepository(UserProfilePharmacy).save({});
  doctorProfile = await dataSource.getRepository(UserProfileDoctor).save({});

  users = await dataSource.getRepository(UserAuth).save([
    {
      email: 'user1@email.com',
      phone: '01234567891',
      user_type: UserType.company,
      role_id: { id: roles.find((role) => role.key === SystemRoles.company_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      user_company_profile: { id: companyProfile.id },
    },
    {
      email: 'user2@email.com',
      phone: '01234567891',
      user_type: UserType.pharmacy,
      role_id: { id: roles.find((role) => role.key === SystemRoles.pharmacy_owner)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      user_pharmacy_profile: { id: pharmacyProfile.id },
    },
    {
      email: 'user3@email.com',
      phone: '01234567891',
      user_type: UserType.doctor,
      role_id: { id: roles.find((role) => role.key === SystemRoles.doctor)?.id },
      is_verified: true,
      is_verified_by_crm: true,
      user_doctor_profile: { id: doctorProfile.id },
    },
  ]);
});

describe('profile', () => {
  it('should update profile successfully for company', async () => {
    const response = await request
      .patch('/api/v1/auth/profile')
      .send({
        first_name: 'NewFirstName',
        last_name: 'NewLastName',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const userProfile = await dataSource
      .getRepository(UserProfileCompany)
      .findOne({ where: { id: companyProfile.id } });
    expect(userProfile).toBeTruthy();
    expect(userProfile!.first_name).toBe('NewFirstName');
    expect(userProfile!.last_name).toBe('NewLastName');
  });

  it('should update profile successfully for doctor', async () => {
    users[2].user_type = UserType.doctor;
    await dataSource.getRepository(UserAuth).save(users[2]);

    const response = await request
      .patch('/api/v1/auth/profile')
      .send({
        first_name: 'NewFirstName',
        last_name: 'NewLastName',
      })
      .set('id', users[2].id);

    expect(response.status).toBe(200);

    const userProfile = await dataSource
      .getRepository(UserProfileDoctor)
      .findOne({ where: { id: doctorProfile.id } });
    expect(userProfile).toBeTruthy();
    expect(userProfile!.first_name).toBe('NewFirstName');
    expect(userProfile!.last_name).toBe('NewLastName');
  });

  it('should update profile successfully for pharmacy', async () => {
    const response = await request
      .patch('/api/v1/auth/profile')
      .send({
        name: 'newFirstName',
      })
      .set('id', users[1].id);

    expect(response.status).toBe(200);

    const userProfile = await dataSource
      .getRepository(UserProfilePharmacy)
      .findOne({ where: { id: pharmacyProfile.id } });
    expect(userProfile).toBeTruthy();
    expect(userProfile!.name).toBe('newFirstName');
  });

  it('should fetch profile successfully for company', async () => {
    const response = await request.get('/api/v1/auth/profile').set('id', users[0].id);

    expect(response.status).toBe(200);
  });

  it('should fetch profile successfully for doctor', async () => {
    const response = await request.get('/api/v1/auth/profile').set('id', users[2].id);

    expect(response.status).toBe(200);
  });

  it('should fetch profile successfully for pharmacy', async () => {
    const response = await request.get('/api/v1/auth/profile').set('id', users[1].id);

    expect(response.status).toBe(200);
  });

  it('should fetch profile successfully for company', async () => {
    const response = await request.get('/api/v1/auth/profile').set('id', users[0].id);

    expect(response.status).toBe(200);
    const profile = response.body.data;
    expect(profile).toBeTruthy();
    expect(profile.first_name).toBeDefined();
    expect(profile.last_name).toBeDefined();
    expect(profile.country_id).toBeDefined();
    expect(profile.city_id).toBeDefined();
    expect(profile.state_id).toBeDefined();
    expect(profile.profile_image).toBeDefined();
  });

  it('should fetch profile successfully for doctor', async () => {
    const response = await request.get('/api/v1/auth/profile').set('id', users[2].id);

    expect(response.status).toBe(200);
    const profile = response.body.data;
    expect(profile).toBeTruthy();
    expect(profile.first_name).toBeDefined();
    expect(profile.last_name).toBeDefined();
    expect(profile.country_id).toBeDefined();
    expect(profile.city_id).toBeDefined();
    expect(profile.state_id).toBeDefined();
    expect(profile.profile_image).toBeDefined();
  });

  it('should fetch profile successfully for pharmacy', async () => {
    const response = await request.get('/api/v1/auth/profile').set('id', users[1].id);

    expect(response.status).toBe(200);
    const profile = response.body.data;
    expect(profile).toBeTruthy();
    expect(profile.name).toBeDefined();
    expect(profile.owner_name).toBeDefined();
    expect(profile.owner_phone_number).toBeDefined();
    expect(profile.pharmacy_number).toBeDefined();
    expect(profile.country_id).toBeDefined();
    expect(profile.city_id).toBeDefined();
    expect(profile.state_id).toBeDefined();
    expect(profile.profile_image).toBeDefined();
    expect(profile.license_image).toBeDefined();
  });

  it('should update profile successfully for company', async () => {
    const country = await dataSource.getRepository(Country).save({ title: 'new country' });
    const city = await dataSource.getRepository(City).save({ title: 'new city' });
    const state = await dataSource.getRepository(State).save({ title: 'new state' });
    const response = await request
      .patch('/api/v1/auth/profile')
      .send({
        first_name: 'NewFirstName',
        last_name: 'NewLastName',
        country_id: country.id,
        city_id: city.id,
        state_id: state.id,
        profile_image: 'newProfileImage',
      })
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const userProfile = await dataSource
      .getRepository(UserProfileCompany)
      .findOne({ where: { id: companyProfile.id }, loadRelationIds: true });
    expect(userProfile).toBeTruthy();
    expect(userProfile!.first_name).toBe('NewFirstName');
    expect(userProfile!.last_name).toBe('NewLastName');
    expect(userProfile!.country_id).toBe(country.id);
    expect(userProfile!.city_id).toBe(city.id);
    expect(userProfile!.state_id).toBe(state.id);
    expect(userProfile!.profile_image).toBeNull();
  });

  it('should update profile successfully for doctor', async () => {
    const country = await dataSource.getRepository(Country).save({ title: 'new country' });
    const city = await dataSource.getRepository(City).save({ title: 'new city' });
    const state = await dataSource.getRepository(State).save({ title: 'new state' });
    users[0].user_type = UserType.doctor;
    await dataSource.getRepository(UserAuth).save(users[0]);

    const response = await request
      .patch('/api/v1/auth/profile')
      .send({
        first_name: 'NewFirstName',
        last_name: 'NewLastName',
        country_id: country.id,
        city_id: city.id,
        state_id: state.id,
        profile_image: 'newProfileImage',
      })
      .set('id', users[2].id);

    expect(response.status).toBe(200);

    const userProfile = await dataSource
      .getRepository(UserProfileDoctor)
      .findOne({ where: { id: doctorProfile.id }, loadRelationIds: true });
    expect(userProfile).toBeTruthy();
    expect(userProfile!.first_name).toBe('NewFirstName');
    expect(userProfile!.last_name).toBe('NewLastName');
    expect(userProfile!.country_id).toBe(country.id);
    expect(userProfile!.city_id).toBe(city.id);
    expect(userProfile!.state_id).toBe(state.id);
    expect(userProfile!.profile_image).toBeNull();
  });

  it('should update profile successfully for pharmacy', async () => {
    const country = await dataSource.getRepository(Country).save({ title: 'new country' });
    const city = await dataSource.getRepository(City).save({ title: 'new city' });
    const state = await dataSource.getRepository(State).save({ title: 'new state' });

    const response = await request
      .patch('/api/v1/auth/profile')
      .send({
        name: 'NewPharmacyName',
        owner_name: 'NewOwnerName',
        owner_phone_number: '01234567891',
        pharmacy_number: '01234567891',
        country_id: country.id,
        city_id: city.id,
        state_id: state.id,
        profile_image: 'newProfileImage',
        license_image: 'newLicenseImage',
      })
      .set('id', users[1].id);

    expect(response.status).toBe(200);

    const userProfile = await dataSource
      .getRepository(UserProfilePharmacy)
      .findOne({ where: { id: pharmacyProfile.id }, loadRelationIds: true });
    expect(userProfile).toBeTruthy();
    expect(userProfile!.name).toBe('NewPharmacyName');
    expect(userProfile!.owner_name).toBe('NewOwnerName');
    expect(userProfile!.owner_phone_number).toBe('01234567891');
    expect(userProfile!.pharmacy_number).toBe('01234567891');
    expect(userProfile!.country_id).toBe(country.id);
    expect(userProfile!.city_id).toBe(city.id);
    expect(userProfile!.state_id).toBe(state.id);
    expect(userProfile!.profile_image).toBeNull();
    expect(userProfile!.license_image).toBeNull();
  });

  it('should fetch profile successfully for company', async () => {
    const response = await request.get('/api/v1/auth/profile').set('id', users[0].id);

    expect(response.status).toBe(200);
    const profile = response.body.data;
    expect(profile).toBeTruthy();
    expect(profile.first_name).toBeDefined();
    expect(profile.last_name).toBeDefined();
    expect(profile.country_id).toBeDefined();
    expect(profile.city_id).toBeDefined();
    expect(profile.state_id).toBeDefined();
    expect(profile.profile_image).toBeDefined();
  });

  it('should fetch profile successfully for doctor', async () => {
    const response = await request.get('/api/v1/auth/profile').set('id', users[2].id);

    expect(response.status).toBe(200);
    const profile = response.body.data;
    expect(profile).toBeTruthy();
    expect(profile.first_name).toBeDefined();
    expect(profile.last_name).toBeDefined();
    expect(profile.country_id).toBeDefined();
    expect(profile.city_id).toBeDefined();
    expect(profile.state_id).toBeDefined();
    expect(profile.profile_image).toBeDefined();
  });

  it('should fetch profile successfully for pharmacy', async () => {
    const response = await request.get('/api/v1/auth/profile').set('id', users[1].id);

    expect(response.status).toBe(200);
    const profile = response.body.data;
    expect(profile).toBeTruthy();
    expect(profile.name).toBeDefined();
    expect(profile.owner_name).toBeDefined();
    expect(profile.owner_phone_number).toBeDefined();
    expect(profile.pharmacy_number).toBeDefined();
    expect(profile.country_id).toBeDefined();
    expect(profile.city_id).toBeDefined();
    expect(profile.state_id).toBeDefined();
    expect(profile.profile_image).toBeDefined();
    expect(profile.license_image).toBeDefined();
  });

  it('should update profile image successfully for company', async () => {
    const response = await request
      .patch('/api/v1/auth/profile')
      .set('Content-Type', 'multipart/form-data')
      .attach('profile_image', path.resolve('./src/__mock__/download.jpeg'))
      .set('id', users[0].id);

    expect(response.status).toBe(200);

    const userProfile = await dataSource
      .getRepository(UserProfileCompany)
      .findOne({ where: { id: companyProfile.id } });
    expect(userProfile).toBeTruthy();
    expect(userProfile!.profile_image.startsWith('profile/')).toBeTruthy();
  });

  it('should update license image successfully for pharmacy', async () => {
    const response = await request
      .patch('/api/v1/auth/profile')
      .set('Content-Type', 'multipart/form-data')
      .attach('license_image', path.resolve('./src/__mock__/download.jpeg'))
      .set('id', users[1].id);

    expect(response.status).toBe(200);

    const userProfile = await dataSource
      .getRepository(UserProfilePharmacy)
      .findOne({ where: { id: pharmacyProfile.id } });
    expect(userProfile).toBeTruthy();
    expect(userProfile!.license_image.startsWith('profile/')).toBeTruthy();
  });

  it('should update both profile and license images successfully for pharmacy', async () => {
    const response = await request
      .patch('/api/v1/auth/profile')
      .set('Content-Type', 'multipart/form-data')
      .attach('profile_image', path.resolve('./src/__mock__/download.jpeg'))
      .attach('license_image', path.resolve('./src/__mock__/download.jpeg'))
      .set('id', users[1].id);

    expect(response.status).toBe(200);

    const userProfile = await dataSource
      .getRepository(UserProfilePharmacy)
      .findOne({ where: { id: pharmacyProfile.id } });
    expect(userProfile).toBeTruthy();
    expect(userProfile!.profile_image.startsWith('profile/')).toBeTruthy();
    expect(userProfile!.license_image.startsWith('profile/')).toBeTruthy();
  });
});
