export enum PERMISSIONS {
  // auth
  auth = 'auth',
  change_password = 'change_password',
  update_email = 'update_email',
  update_profile = 'update_profile',
  find_users = 'find_users',
  // role
  role = 'role',
  create_role = 'create_role',
  get_role = 'get_role',
  update_role = 'update_role',
  remove_role = 'remove_role',
  // country
  country = 'country',
  create_country = 'create_country',
  remove_country = 'remove_country',
  // city
  city = 'city',
  create_city = 'create_city',
  remove_city = 'remove_city',
  // state
  state = 'state',
  create_state = 'create_state',
  remove_state = 'remove_state',
  // allowed time
  allowed_times = 'allowed_times',
  update_allowed_visit_time = 'update_allowed_visit_time',
  get_allowed_visit_time = 'get_allowed_visit_time',
  // permissions
  permission = 'permission',
  get_permissions = 'get_permissions',
  update_permission = 'update_permission',
  // article
  article = 'article',
  create_article = 'create_article',
  get_articles = 'get_articles',
  get_article = 'get_article',
  update_article = 'update_article',
  remove_article = 'remove_article',
  // comment
  comment = 'comment',
  create_comment = 'create_comment',
  get_comments = 'get_comments',
  get_comment = 'get_comment',
  update_comment = 'update_comment',
  remove_comment = 'remove_comment',
  // toggle action
  article_action = 'article_action',
  comment_action = 'comment_action',
  //doctor specialty
  doctor_specialty = 'doctor_specialty',
  create_doctor_specialty = 'create_doctor_specialty',
  update_doctor_specialty = 'update_doctor_specialty',
  remove_doctor_specialty = 'remove_doctor_specialty',
  // vacation
  vacation = 'vacation',
  create_vacation = 'create_vacation',
  get_vacation = 'get_vacation',
  update_vacation = 'update_vacation',
  remove_vacation = 'remove_vacation',
  // vacation request
  vacation_request = 'vacation_request',
  gift_vacation_request = 'gift_vacation_request',
  request_vacation_request = 'request_vacation_request',
  get_vacation_request = 'get_vacation_request',
  update_vacation_request = 'update_vacation_request',
  remove_vacation_request = 'remove_vacation_request',
  retreive_rest_vacation_days = 'retreive_rest_vacation_days',
  // rewards
  reward = 'reward',
  create_reward = 'create_reward',
  give_reward = 'give_reward',
  //tasks
  task = 'task',
  create_task = 'create_task',
  get_tasks = 'get_tasks',
  get_logged_user_tasks = 'get_logged_user_tasks',
  update_task = 'update_task',
  delete_task = 'delete_task',
  update_task_status = 'update_task_status',
  // target
  target = 'target',
  create_target = 'create_target',
  update_target = 'update_target',
  remove_target = 'remove_target',
  get_all_target = 'get_all_target',
  get_one_target = 'get_one_target',
  // point
  point = 'point',
  create_point = 'create_point',
  get_points = 'get_points',
  get_point = 'get_point',
  update_point = 'update_point',
  remove_point = 'remove_point',

  // commission
  create_commission = 'create_commission',
  get_commission = 'get_commission',
  update_commission = 'update_commission',
  remove_commission = 'remove_commission',
  // commission request
  create_commission_request = 'create_commission_request',
  get_commission_request = 'get_commission_request',
  update_commission_request = 'update_commission_request',
  remove_commission_request = 'remove_commission_request',

  add_gift = 'add_gift',
  // punishment
  punishment = 'punishment',
  create_punishment = 'create_punishment',
  get_punishment = 'get_punishment',
  update_punishment = 'update_punishment',
  remove_punishment = 'remove_punishment',
  //punishment request
  give_punishment_request = 'give_punishment_request',
  get_punishment_request = 'get_punishment_request',
  remove_punishment_request = 'remove_punishment_request',

  // salary
  // create_salary = 'create_salary',
  // update_salary = 'update_salary',
  // get_salary = 'get_salary',
  // get_own_salaries = 'get_own_salaries',
  // get_salaries = 'get_salaries',
  // delete_salary = 'delete_salary',
  manage_salary = 'manage_salary',
  read_salary = 'read_salary',
  manage_salary_history = 'manage_salary_history',
  read_logged_user_salary = 'read_logged_user_salary',
  receive_salary = 'receive_salary',

  // medicineCategories
  create_medicine_category = 'create_medicine_category',
  get_all_medicine_category = 'get_all_medicine_category',
  get_one_medicine_category = 'get_one_medicine_category',
  update_medicine_category = 'update_medicine_category',
  remove_medicine_category = 'remove_medicine_category',
  // products
  create_product = 'create_product',
  get_all_product = 'get_all_product',
  get_one_product = 'get_one_product',
  update_product = 'update_product',
  remove_product = 'remove_product',
  update_quantity = 'update_quantity',
  //points request
  get_point_requests = 'get_point_requests',
  get_provider_point_requests = 'get_provider_point_requests',
  create_point_request = 'create_point_request',
  get_point_request = 'get_point_request',
  update_point_request = 'update_point_request',
  remove_point_request = 'remove_point_request',
  create_withdraw_point_request = 'create_withdraw_point_request',
}
