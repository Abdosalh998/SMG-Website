const FAQ = require('../models/FAQ');

// Default FAQ data to seed if collection is empty
const defaultFAQs = [
    {
        questionAr: 'ما هي مواعيد العمل / التواصل؟',
        questionEn: 'What are the working / contact hours?',
        answerAr: 'يومياً من الساعة 10:00 صباحاً وحتى 10:00 مساءً.',
        answerEn: 'Daily from 10:00 AM to 10:00 PM.',
        order: 1
    },
    {
        questionAr: 'كيف يمكنني الحجز أو الطلب؟',
        questionEn: 'How can I place an order or make a reservation?',
        answerAr: 'يمكنك الطلب مباشرة من خلال الموقع، وبعد تأكيد الطلب سيتم تحويلك إلى WhatsApp لإرسال تفاصيل الطلب والتواصل مع فريق المبيعات.',
        answerEn: 'You can order directly through the website. After placing your order, you will be redirected to WhatsApp to send the order details and communicate with our sales team.',
        order: 2
    },
    {
        questionAr: 'هل يتوفر شحن / توصيل؟',
        questionEn: 'Is shipping / delivery available?',
        answerAr: 'نعم، نوفر خدمة الشحن إلى جميع المحافظات داخل مصر، وتختلف تكلفة الشحن حسب المحافظة التي يختارها العميل أثناء إتمام الطلب. عادةً ما يستغرق التوصيل من 2 إلى 5 أيام عمل.',
        answerEn: 'Yes, we provide shipping to all governorates within Egypt. The shipping cost varies depending on the governorate selected by the customer during checkout. Delivery usually takes 2 to 5 business days.',
        order: 3
    },
    {
        questionAr: 'كيف يمكنني إلغاء أو تعديل الطلب؟',
        questionEn: 'How can I cancel or modify my order?',
        answerAr: 'يمكنك التواصل معنا عبر WhatsApp أو خدمة العملاء خلال 24 ساعة من تأكيد الطلب، وسنعمل على تعديل أو إلغاء الطلب إذا لم يتم شحنه بعد.',
        answerEn: 'You can contact us via WhatsApp or customer service within 24 hours of order confirmation, and we will modify or cancel the order if it has not been shipped yet.',
        order: 4
    }
];

// @desc    Get all FAQs
// @route   GET /api/v1/faq
// @access  Public
exports.getFAQs = async (req, res) => {
    try {
        // Auto-seed default FAQs if empty
        const count = await FAQ.countDocuments();
        if (count === 0) {
            await FAQ.insertMany(defaultFAQs);
        }

        const query = req.query.isActive === 'true' ? { isActive: true } : {};
        const faqs = await FAQ.find(query).sort('order');
        res.status(200).json({ success: true, count: faqs.length, data: faqs });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create FAQ
// @route   POST /api/v1/faq
// @access  Private/Admin
exports.createFAQ = async (req, res) => {
    try {
        // Auto-assign order if not provided
        if (req.body.order === undefined) {
            const maxOrder = await FAQ.findOne().sort('-order').select('order');
            req.body.order = maxOrder ? maxOrder.order + 1 : 1;
        }
        const faq = await FAQ.create(req.body);
        res.status(201).json({ success: true, data: faq });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update FAQ
// @route   PUT /api/v1/faq/:id
// @access  Private/Admin
exports.updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!faq) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: faq });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete FAQ
// @route   DELETE /api/v1/faq/:id
// @access  Private/Admin
exports.deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) return res.status(404).json({ success: false, error: 'Not found' });
        await faq.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Reorder FAQs
// @route   PUT /api/v1/faq/reorder
// @access  Private/Admin
exports.reorderFAQs = async (req, res) => {
    try {
        // req.body.items = [{ id, order }, ...]
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ success: false, error: 'items array required' });
        }
        const updates = items.map(({ id, order }) =>
            FAQ.findByIdAndUpdate(id, { order })
        );
        await Promise.all(updates);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
