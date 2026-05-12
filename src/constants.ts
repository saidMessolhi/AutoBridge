import { ImportStage } from './types';

export const STAGE_LABELS: Record<ImportStage, string> = {
  [ImportStage.NEW_REQUEST]: 'طلب جديد',
  [ImportStage.UNDER_REVIEW]: 'قيد الدراسة',
  [ImportStage.SEARCHING_CAR]: 'البحث في الصين',
  [ImportStage.CLIENT_APPROVED]: 'موافقة العميل',
  [ImportStage.DEPOSIT_PAID]: 'دفع العربون',
  [ImportStage.PURCHASED]: 'تم الشراء',
  [ImportStage.INLAND_TRANSPORT]: 'النقل الداخلي',
  [ImportStage.SHIPPED]: 'تم الشحن البحري',
  [ImportStage.IN_TRANSIT]: 'في الرحلة البحرية',
  [ImportStage.ARRIVED_PORT]: 'وصلت للميناء',
  [ImportStage.CUSTOMS_CLEARANCE]: 'التخليص الجمركي',
  [ImportStage.FINAL_PAYMENT]: 'المستحقات النهائية',
  [ImportStage.DELIVERED]: 'تم التسليم',
};

export const STAGE_DESCRIPTIONS: Record<ImportStage, string> = {
  [ImportStage.NEW_REQUEST]: 'تم استلام طلبك وبانتظار المراجعة من فريقنا',
  [ImportStage.UNDER_REVIEW]: 'نقوم بمراجعة المواصفات والميزانية المطلوبة',
  [ImportStage.SEARCHING_CAR]: 'فريقنا في الصين يبحث عن أفضل الخيارات المتاحة',
  [ImportStage.CLIENT_APPROVED]: 'تم اختيار السيارة والموافقة على العرض',
  [ImportStage.DEPOSIT_PAID]: 'تم تأكيد دفع العربون، نبدأ إجراءات الشراء',
  [ImportStage.PURCHASED]: 'تم شراء السيارة وتوقيع العقود مع المورد',
  [ImportStage.INLAND_TRANSPORT]: 'يتم نقل السيارة إلى ميناء التصدير في الصين',
  [ImportStage.SHIPPED]: 'غادرت السفينة الميناء الصيني بسلام',
  [ImportStage.IN_TRANSIT]: 'الحاوية في طريقها عبر المحيط',
  [ImportStage.ARRIVED_PORT]: 'وصلت السفينة إلى ميناء الوصول المحلي',
  [ImportStage.CUSTOMS_CLEARANCE]: 'تتم الآن إجراءات الجمركة واستخراج الوثائق',
  [ImportStage.FINAL_PAYMENT]: 'بانتظار تسوية التكاليف النهائية للشحن والجمارك',
  [ImportStage.DELIVERED]: 'تم تسليم السيارة للعميل بنجاح',
};
