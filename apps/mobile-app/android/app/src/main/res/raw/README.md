# Android Notification Sounds

هذا المجلد يحتوي على أصوات الإشعارات لنظام Android.

## الملفات المطلوبة:

يجب نسخ الملفات التالية من `assets/sounds/` إلى هنا:

- `alert_critical.mp3`
- `alert_high.mp3`
- `alert_medium.mp3`
- `alert_low.mp3`

## ملاحظات:
- يجب أن تكون الأسماء بحروف صغيرة فقط
- لا تستخدم مسافات في الأسماء
- استخدم underscores بدلاً من الشرطات

## البديل:
إذا كنت تستخدم ملفات صوتية من الإنترنت، يمكنك استخدام:
```bash
cd flutter_app/android/app/src/main/res/raw
cp ../../../../../../../assets/sounds/*.mp3 .
```
