const express = require('express');
const path = require('path');
const xlsx = require('xlsx');

const app = express();
const PORT = 3000;

// إضافة middleware لتحليل البيانات القادمة من النماذج
app.use(express.json()); // لتحليل بيانات JSON
app.use(express.urlencoded({ extended: true })); // لتحليل بيانات النماذج

// إعداد ملفات الواجهة
app.use(express.static(path.join(__dirname, 'public')));

// قراءة بيانات Excel
const workbook1 = xlsx.readFile('salaries.xlsx');
const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
const data1 = xlsx.utils.sheet_to_json(sheet1);
const employees1 = {};

data1.forEach(row => {
    employees1[row.ID] = {
        'مضيف لمدة ساعتين': row['مضيف لمدة ساعتين'],
        'عدد الماسات المجمعة': row['عدد الماسات المجمعة'],
        'الراتب': row['الراتب']
    };
});

const workbook2 = xlsx.readFile('salaries_target.xlsx');
const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
const data2 = xlsx.utils.sheet_to_json(sheet2);
const employees2 = {};

data2.forEach(row => {
    employees2[row.ID] = {
        'مضيف التارجت': row['مضيف التارجت'],
        'عدد الماسات المجمعة': row['عدد الماسات المجمعة'],
        'الراتب': row['الراتب']
    };
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// البحث عن الموظف باستخدام ID
app.get('/search', (req, res) => {
    const { id } = req.query;
    const isDecimalRemoval = req.query.decimal === 'true';
    let response = "";
    let hasData = false;

    if (employees1[id]) {
        const details = employees1[id];
        const salary = isDecimalRemoval ? Math.floor(details['الراتب']) : details['الراتب'];
        response += `
            <h3>🔵 رواتب مضيف ساعات</h3>
            <p>🆔 ID: ${id}</p>
            <p>📅 مضيف لمدة ساعتين: ${details['مضيف لمدة ساعتين']}</p>
            <p>💎 عدد الماسات المجمعة: ${details['عدد الماسات المجمعة']}</p>
            <p>💰 الراتب: ${salary}</p><hr>
        `;
        hasData = true;
    }

    if (employees2[id]) {
        const details = employees2[id];
        const salary = isDecimalRemoval ? Math.floor(details['الراتب']) : details['الراتب'];
        response += `
            <h3>🟢 رواتب مضيف تارجت</h3>
            <p>🆔 ID: ${id}</p>
            <p>📅 مضيف التارجت: ${details['مضيف التارجت']}</p>
            <p>💎 عدد الماسات المجمعة: ${details['عدد الماسات المجمعة']}</p>
            <p>💰 الراتب: ${salary}</p><hr>
        `;
        hasData = true;
    }

    if (hasData) {
        res.send(response);
    } else {
        res.send("<p>❌ لم يتم العثور على بيانات لهذا الموظف.</p>");
    }
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
