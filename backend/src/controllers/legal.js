const LegalPage = require('../models/LegalPage');

const defaultTerms = {
    slug: 'terms',
    titleEn: 'Terms & Conditions',
    titleAr: 'شروط وأحكام استخدام SMG',
    introEn: 'Welcome to SMG. By using this website, you agree to comply with the following terms and conditions:',
    introAr: 'مرحبًا بك في SMG. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية:',
    sections: [
        {
            titleEn: '1. Intellectual Property',
            titleAr: '1. الملكية الفكرية',
            contentEn: 'All content on this website, including texts, images, designs, logos, and visual identity, is the exclusive property of SMG and may not be copied, reused, distributed, or exploited for any commercial purpose without prior written consent.',
            contentAr: 'جميع محتويات الموقع، بما في ذلك النصوص، الصور، التصاميم، الشعارات، والهوية البصرية، هي ملك حصري لـ SMG، ولا يجوز نسخها أو إعادة استخدامها أو توزيعها أو استغلالها لأي غرض تجاري دون الحصول على موافقة خطية مسبقة.',
            order: 1
        },
        {
            titleEn: '2. Acceptable Use',
            titleAr: '2. الاستخدام المقبول',
            contentEn: 'The website must be used for lawful purposes only, in a manner that does not negatively affect the website or its users.\n\nThe following are strictly prohibited:\n• Attempting to hack the site or gain unauthorized access.\n• Publishing offensive or illegal content.\n• Misusing the services or disrupting the website\'s operation.',
            contentAr: 'يجب استخدام الموقع للأغراض المشروعة فقط، وبطريقة لا تؤثر سلبًا على الموقع أو مستخدميه.\n\nويُمنع بشكل كامل:\n• محاولة اختراق الموقع أو الوصول غير المصرح به.\n• نشر أي محتوى مسيء أو مخالف للقانون.\n• إساءة استخدام الخدمات أو تعطيل عمل الموقع.',
            order: 2
        },
        {
            titleEn: '3. Products & Prices',
            titleAr: '3. المنتجات والأسعار',
            contentEn: 'SMG strives to provide accurate information and pricing, however we reserve the right to:\n• Modify prices at any time.\n• Update or remove any product.\n• Modify or discontinue promotions without prior notice.',
            contentAr: 'تسعى SMG إلى توفير معلومات وأسعار دقيقة، ومع ذلك نحتفظ بالحق في:\n• تعديل الأسعار في أي وقت.\n• تحديث أو إزالة أي منتج.\n• تعديل العروض أو إيقافها دون إشعار مسبق.',
            order: 3
        },
        {
            titleEn: '4. Disclaimer',
            titleAr: '4. إخلاء المسؤولية',
            contentEn: 'We do our best to ensure accuracy and service continuity, but we are not responsible for:\n• Any unintentional errors in content.\n• Any temporary service interruption due to maintenance or technical issues.\n• Any damages resulting from improper use of the website.',
            contentAr: 'نبذل قصارى جهدنا لضمان دقة المعلومات واستمرارية الخدمة، ولكن لا نتحمل المسؤولية عن:\n• أي أخطاء غير مقصودة في المحتوى.\n• أي انقطاع مؤقت في الخدمة بسبب أعمال الصيانة أو المشكلات التقنية.\n• أي أضرار ناتجة عن استخدام الموقع بشكل غير صحيح.',
            order: 4
        },
        {
            titleEn: '5. Modification of Terms',
            titleAr: '5. تعديل الشروط',
            contentEn: 'SMG reserves the right to update or modify these terms and conditions at any time. All modifications take effect immediately upon publication on this page. Continued use of the website constitutes acceptance of the updated version.',
            contentAr: 'يحق لـ SMG تحديث أو تعديل هذه الشروط والأحكام في أي وقت. تسري جميع التعديلات فور نشرها على هذه الصفحة، ويُعد استمرار استخدام الموقع موافقة على النسخة المحدثة.',
            order: 5
        },
        {
            titleEn: '6. Contact Us',
            titleAr: '6. التواصل معنا',
            contentEn: 'If you have any questions regarding these terms of use, you can contact us through our contact page or via WhatsApp.',
            contentAr: 'إذا كانت لديك أي استفسارات بخصوص شروط الاستخدام، يمكنك التواصل معنا من خلال صفحة اتصل بنا أو عبر WhatsApp.',
            order: 6
        }
    ],
    isActive: true,
    lastUpdated: new Date()
};

const defaultPrivacy = {
    slug: 'privacy',
    titleEn: 'Privacy Policy',
    titleAr: 'سياسة الخصوصية لـ SMG',
    introEn: 'At SMG, we place great importance on the privacy of our customers and website visitors, and we are committed to protecting their personal data in accordance with best security practices.',
    introAr: 'في SMG، نولي خصوصية عملائنا وزوار موقعنا أهمية كبيرة، ونلتزم بحماية بياناتهم الشخصية وفق أفضل الممارسات الأمنية.',
    sections: [
        {
            titleEn: '1. Information We Collect',
            titleAr: '1. المعلومات التي نقوم بجمعها',
            contentEn: 'We may collect certain personal information when you use the website or contact us, such as:\n• Full name\n• Phone number\n• Email address (optional)\n• Shipping address\n• Governorate and city\n• Order details\n• Any information shared by the customer when contacting us.',
            contentAr: 'قد نقوم بجمع بعض المعلومات الشخصية عند استخدام الموقع أو التواصل معنا، مثل:\n• الاسم الكامل\n• رقم الهاتف\n• البريد الإلكتروني (اختياري)\n• عنوان الشحن\n• المحافظة والمدينة\n• تفاصيل الطلبات\n• أي معلومات يشاركها العميل عند التواصل معنا.',
            order: 1
        },
        {
            titleEn: '2. How We Use Your Data',
            titleAr: '2. كيفية استخدام البيانات',
            contentEn: 'We use the information we collect for the following purposes:\n• Processing and managing orders.\n• Communicating with customers regarding their orders or inquiries.\n• Improving service quality and user experience.\n• Sending order-related notifications.\n• Sending offers or news if the customer has consented.',
            contentAr: 'نستخدم المعلومات التي نجمعها للأغراض التالية:\n• معالجة الطلبات وإدارتها.\n• التواصل مع العميل بشأن الطلب أو الاستفسارات.\n• تحسين جودة الخدمات وتجربة المستخدم.\n• إرسال الإشعارات المتعلقة بالطلبات.\n• إرسال العروض أو الأخبار في حال موافقة العميل على ذلك.',
            order: 2
        },
        {
            titleEn: '3. Data Protection',
            titleAr: '3. حماية البيانات',
            contentEn: 'SMG is committed to taking appropriate security measures to protect customer data from:\n• Unauthorized access.\n• Unlawful modification or disclosure.\n• Loss or damage.\n\nWe do not sell, rent, or share personal data with any third party unless required by law or to fulfil an order.',
            contentAr: 'تلتزم SMG باتخاذ الإجراءات الأمنية المناسبة لحماية بيانات العملاء من:\n• الوصول غير المصرح به.\n• التعديل أو الإفصاح غير القانوني.\n• الفقدان أو التلف.\n\nولا نقوم ببيع أو تأجير أو مشاركة البيانات الشخصية مع أي طرف ثالث، إلا إذا كان ذلك مطلوبًا بموجب القانون أو لتنفيذ الطلب.',
            order: 3
        },
        {
            titleEn: '4. Cookies',
            titleAr: '4. ملفات تعريف الارتباط (Cookies)',
            contentEn: 'The website uses cookies to:\n• Improve the user experience.\n• Remember the preferred language (Arabic or English).\n• Save shopping cart contents.\n• Improve website performance and analyse usage.\n\nUsers can disable cookies through their browser settings, though some website functions may not work optimally.',
            contentAr: 'يستخدم الموقع ملفات تعريف الارتباط (Cookies) من أجل:\n• تحسين تجربة المستخدم.\n• تذكر اللغة المفضلة (العربية أو الإنجليزية).\n• حفظ محتويات سلة التسوق.\n• تحسين أداء الموقع وتحليل الاستخدام.\n\nيمكن للمستخدم تعطيل ملفات تعريف الارتباط من خلال إعدادات المتصفح، مع العلم أن بعض وظائف الموقع قد لا تعمل بالشكل الأمثل.',
            order: 4
        },
        {
            titleEn: '5. Your Rights',
            titleAr: '5. حقوق المستخدم',
            contentEn: 'You have the right to:\n• Request access to your personal data.\n• Request correction of your data.\n• Request deletion of your data, unless retention is required for legal or operational reasons.\n• Contact us to enquire about how your data is used.',
            contentAr: 'يحق للمستخدم:\n• طلب الاطلاع على بياناته الشخصية.\n• طلب تعديل بياناته.\n• طلب حذف بياناته، ما لم يكن الاحتفاظ بها مطلوبًا لأسباب قانونية أو تشغيلية.\n• التواصل معنا للاستفسار عن كيفية استخدام بياناته.',
            order: 5
        },
        {
            titleEn: '6. Policy Updates',
            titleAr: '6. تحديث سياسة الخصوصية',
            contentEn: 'SMG may update this Privacy Policy from time to time in line with service developments or legal requirements. Any updates are published on this page, and continued use of the website constitutes acceptance of the updated version.',
            contentAr: 'قد تقوم SMG بتحديث سياسة الخصوصية من وقت لآخر بما يتوافق مع تطوير الخدمات أو المتطلبات القانونية. ويتم نشر أي تحديثات على هذه الصفحة، ويعتبر استمرار استخدام الموقع موافقة على النسخة المحدثة.',
            order: 6
        },
        {
            titleEn: '7. Contact Us',
            titleAr: '7. التواصل معنا',
            contentEn: 'If you have any questions about our Privacy Policy or how your data is processed, you can contact us through our contact page or via WhatsApp.',
            contentAr: 'إذا كانت لديك أي استفسارات بخصوص سياسة الخصوصية أو كيفية معالجة بياناتك، يمكنك التواصل معنا عبر صفحة اتصل بنا أو من خلال WhatsApp.',
            order: 7
        }
    ],
    isActive: true,
    lastUpdated: new Date()
};

// @desc    Get a legal page by slug
// @route   GET /api/v1/legal/:slug
// @access  Public
exports.getLegalPage = async (req, res) => {
    try {
        // Auto-seed on first access
        const slug = req.params.slug;
        const count = await LegalPage.countDocuments({ slug });
        if (count === 0) {
            if (slug === 'terms') await LegalPage.create(defaultTerms);
            else if (slug === 'privacy') await LegalPage.create(defaultPrivacy);
        }

        const page = await LegalPage.findOne({ slug: req.params.slug });
        if (!page) return res.status(404).json({ success: false, error: 'Page not found' });
        res.status(200).json({ success: true, data: page });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all legal pages (admin)
// @route   GET /api/v1/legal
// @access  Private/Admin
exports.getLegalPages = async (req, res) => {
    try {
        const pages = await LegalPage.find().select('slug titleEn titleAr isActive lastUpdated');
        res.status(200).json({ success: true, data: pages });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update legal page
// @route   PUT /api/v1/legal/:slug
// @access  Private/Admin
exports.updateLegalPage = async (req, res) => {
    try {
        // Always update lastUpdated when content changes
        req.body.lastUpdated = new Date();

        const page = await LegalPage.findOneAndUpdate(
            { slug: req.params.slug },
            req.body,
            { new: true, runValidators: true, upsert: true }
        );
        res.status(200).json({ success: true, data: page });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
