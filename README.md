# וואו קריספי · אתר

אתר סטטי (HTML/CSS/JS) לוואו קריספי, העצמאות 93, אשדוד.

כתובת חיה: https://oriantoledano-ship-it.github.io/wow-crispy/

## מבנה
- `index.html` - העמוד הראשי (פתיחה, השוואת ציפויים, מנות, תפריט, שעות וכתובת)
- `privacy.html`, `terms.html`, `accessibility.html` - עמודים משפטיים
- `assets/site.css`, `assets/site.js` - עיצוב והתנהגות
- `assets/a11y.css`, `assets/a11y.js` - תפריט נגישות
- `assets/fonts/` - גופנים מקומיים (Rubik, Assistant)
- `assets/img/` - תמונות המנות ואייקונים

## עדכון מחירים בתפריט
המחירים נמצאים ב-`index.html` בתוך `<section class="menu">`. כל מנה היא שורה אחת:
`<li><span class="nm">שם המנה</span><span class="pr">45 ₪</span><span class="ds">תיאור</span></li>`
המחירים באתר הם מחירי ההזמנה הישירה באתר אשדוד בתפריט.

## העלאה ידנית ל-GitHub (אם צריך)
1. יוצרים ריפו חדש (שם קצר באנגלית, אותיות קטנות).
2. נכנסים לתיקייה, מסמנים הכל (Ctrl+A) וגוררים את התוכן עצמו ולא את התיקייה.
3. מוודאים שקבצים מוסתרים מוצגים (View → Show → Hidden items) כדי ש-`.nojekyll` יעלה.
4. Settings → Pages → Branch: main, תיקייה: / (root).

## אם משהו לא עובד
- הכתובת חייבת להסתיים ב-`/`.
- הקבצים צריכים לשבת בשורש הריפו ולא בתוך תיקייה נוספת.
- לוודא ש-Pages מופעל.
