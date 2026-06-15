import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpeg';

const LandingPage = () => {
  useEffect(() => {
    // تفعيل الأسئلة الشائعة
    const faqQuestions = document.querySelectorAll('.faq-question');
    const toggleFaq = function() {
        const item = this.parentElement;
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    };
    faqQuestions.forEach(question => question.addEventListener('click', toggleFaq));

    // مراقب العناصر لظهور سلس واحترافي
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target); 
            }
        });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // تأثيرات شريط التنقل عند التمرير
    const handleScroll = () => {
        const header = document.getElementById('header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.padding = '5px 0';
                header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
            } else {
                header.style.padding = '15px 0';
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
            }
        }
    };
    window.addEventListener('scroll', handleScroll);
    
    // تشغيل التحريك المبدئي للقسم الأول
    const initTimer = setTimeout(() => {
        document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('active'));
    }, 100);

    // Cleanup function
    return () => {
        faqQuestions.forEach(q => q.removeEventListener('click', toggleFaq));
        window.removeEventListener('scroll', handleScroll);
        observer.disconnect();
        clearTimeout(initTimer);
    };
  }, []);

  return (
    <div dir="rtl" className="font-['Tajawal'] text-[#4a5568] bg-white overflow-x-hidden leading-[1.8]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        :root {
            --primary: #0a5f38; 
            --primary-light: #128c55;
            --accent: #d4af37;
            --accent-light: #fbf6e6;
            --dark: #1a252f;
            --text: #4a5568;
            --white: #ffffff;
            --light-bg: #f4f9f6;
            --shadow: 0 15px 35px rgba(10, 95, 56, 0.08);
            --shadow-hover: 0 20px 40px rgba(10, 95, 56, 0.15);
            --transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: var(--primary-light); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--primary); }

        .bg-shapes { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; pointer-events: none; }
        .shape { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; animation: moveBlobs 20s infinite alternate linear; }
        .shape-1 { width: 400px; height: 400px; background: var(--primary-light); top: -10%; right: -5%; }
        .shape-2 { width: 350px; height: 350px; background: var(--accent); bottom: -10%; left: -5%; animation-delay: -5s; }

        @keyframes moveBlobs {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-50px, 50px) scale(1.1); }
            100% { transform: translate(50px, -50px) scale(0.9); }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }

        header { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); box-shadow: 0 4px 20px rgba(0,0,0,0.03); position: fixed; width: 100%; top: 0; z-index: 1000; transition: var(--transition); }
        .nav-container { width: 90%; max-width: 1200px; margin: auto; padding: 15px 0; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 28px; font-weight: 900; color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 12px; letter-spacing: 1px; height: 90px; }
        .logo i { color: var(--accent); }
        nav ul { list-style: none; display: flex; align-items: center; gap: 30px; margin:0; padding:0; }
        nav ul li a { text-decoration: none; color: var(--dark); font-weight: 700; position: relative; padding: 5px 0; transition: var(--transition); }
        nav ul li a::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 3px; background: var(--accent); border-radius: 2px; transition: var(--transition); }
        nav ul li a:hover { color: var(--primary); }
        nav ul li a:hover::after { width: 100%; }

        .btn-main { background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: var(--white) !important; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: 800; box-shadow: 0 8px 20px rgba(10, 95, 56, 0.25); transition: var(--transition); border: 2px solid transparent; display: inline-block; }
        .btn-main:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 25px rgba(10, 95, 56, 0.35); }

        #hero { position: relative; padding: 200px 5% 120px; min-height: 100vh; display: flex; align-items: center; max-width: 1300px; margin: auto; }
        .hero-content { flex: 1.2; padding-left: 50px; z-index: 2; }
        .hero-content h1 { font-size: 54px; color: var(--dark); line-height: 1.4; margin-bottom: 25px; font-weight: 900; }
        .hero-content h1 span { color: var(--primary); position: relative; display: inline-block; }
        .hero-content h1 span::after { content: ''; position: absolute; bottom: 10px; right: 0; width: 100%; height: 12px; background: rgba(212, 175, 55, 0.3); z-index: -1; border-radius: 10px; }
        .hero-content p { font-size: 20px; margin-bottom: 40px; color: var(--text); line-height: 1.9; }
        .hero-image { flex: 1; text-align: center; position: relative; }
        .hero-image::before { content: ''; position: absolute; width: 100%; height: 100%; background: linear-gradient(135deg, var(--accent), var(--primary-light)); border-radius: 30px; top: 20px; left: -20px; z-index: -1; opacity: 0.2; }
        .hero-image img { width: 100%; max-width: 550px; border-radius: 30px; box-shadow: var(--shadow-hover); animation: float 6s ease-in-out infinite; border: 5px solid var(--white); }

        .section-padding { padding: 100px 5%; position: relative; z-index: 2; }
        .section-header { text-align: center; margin-bottom: 70px; }
        .section-header h2 { font-size: 38px; color: var(--dark); display: inline-block; position: relative; font-weight: 800; }
        .section-header h2::after { content: ''; position: absolute; bottom: -15px; right: 50%; transform: translateX(50%); width: 80px; height: 5px; background: var(--accent); border-radius: 5px; }

        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; max-width: 1200px; margin: auto; }
        .card-box { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); padding: 40px 30px; border-radius: 20px; box-shadow: var(--shadow); border-bottom: 5px solid var(--primary); transition: var(--transition); text-align: center; }
        .card-box:hover { transform: translateY(-10px); box-shadow: var(--shadow-hover); border-bottom-color: var(--accent); }
        .card-box i { font-size: 45px; color: var(--primary); margin-bottom: 25px; background: var(--light-bg); width: 90px; height: 90px; line-height: 90px; border-radius: 50%; transition: var(--transition); }
        .card-box:hover i { background: var(--primary); color: var(--white); transform: scale(1.1) rotate(5deg); }
        .card-box h3 { color: var(--dark); margin-bottom: 20px; font-size: 24px; font-weight: 800; }

        .benefits-container { background-color: var(--light-bg); position: relative; }
        .benefits-container::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('data:image/svg+xml;utf8,<svg opacity="0.03" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%230a5f38"/></svg>') repeat; background-size: 600px; z-index: -1; }
        .services-wrapper, .benefits-wrapper { display: flex; flex-wrap: wrap; justify-content: center; gap: 35px; max-width: 1200px; margin: auto; }
        .benefit-card { flex: 1 1 400px; max-width: 550px; background: var(--white); padding: 35px; border-radius: 20px; box-shadow: var(--shadow); display: flex; gap: 25px; align-items: flex-start; transition: var(--transition); border: 1px solid rgba(0,0,0,0.03); }
        .benefit-card:hover { transform: translateX(-10px); box-shadow: var(--shadow-hover); }
        .benefit-icon { width: 65px; height: 65px; background: var(--accent-light); color: var(--accent); border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; transition: var(--transition); }
        .benefit-card:hover .benefit-icon { background: var(--accent); color: var(--white); }
        .benefit-card h3 { color: var(--dark); font-size: 22px; margin-bottom: 12px; font-weight: 800;}

        .steps-container { max-width: 900px; margin: auto; position: relative; padding-right: 40px; border-right: 4px dashed var(--primary-light); }
        .step-item { position: relative; margin-bottom: 50px; padding-right: 30px; }
        .step-item:last-child { margin-bottom: 0; }
        .step-number { position: absolute; right: -66px; top: 0; width: 50px; height: 50px; background: linear-gradient(135deg, var(--accent), #b8952b); color: var(--white); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 22px; border: 6px solid var(--white); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4); z-index: 2; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.5); } 70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
        .step-content { background: var(--white); padding: 30px; border-radius: 20px; box-shadow: var(--shadow); transition: var(--transition); border: 1px solid rgba(0,0,0,0.02); }
        .step-content:hover { transform: scale(1.02); box-shadow: var(--shadow-hover); }
        .step-content h3 { color: var(--primary); margin-bottom: 12px; font-size: 22px; font-weight: 800;}

        .service-card { flex: 1 1 320px; max-width: 350px; background: var(--white); padding: 40px 30px; border-radius: 20px; box-shadow: var(--shadow); text-align: center; transition: var(--transition); display: flex; flex-direction: column; position: relative; overflow: hidden; z-index: 1; }
        .service-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 0; background: linear-gradient(to bottom, var(--primary), var(--primary-light)); transition: var(--transition); z-index: -1; border-radius: 20px; }
        .service-card:hover { transform: translateY(-10px); }
        .service-card:hover::before { height: 100%; }
        .service-card:hover h3, .service-card:hover p { color: var(--white); }
        .service-icon { width: 80px; height: 80px; margin: 0 auto 25px; background: var(--light-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 35px; color: var(--primary); transition: var(--transition); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .service-card:hover .service-icon { background: var(--white); color: var(--primary); transform: rotateY(180deg); }
        .service-card h3 { color: var(--dark); margin-bottom: 15px; font-size: 22px; font-weight: 800; transition: var(--transition); }
        .service-card p { transition: var(--transition); margin: 0; } 

        .faq-max { max-width: 900px; margin: auto; }
        .faq-item { background: var(--white); border-radius: 15px; margin-bottom: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.03); overflow: hidden; }
        .faq-question { padding: 25px 30px; color: var(--dark); font-weight: 800; font-size: 18px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: var(--transition); }
        .faq-question i { background: var(--light-bg); width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: var(--primary); transition: var(--transition); }
        .faq-question:hover { color: var(--primary); }
        .faq-answer { padding: 0 30px; max-height: 0; overflow: hidden; transition: all 0.4s ease-out; background: var(--white); color: var(--text); line-height: 1.8; }
        .faq-item.active .faq-question { color: var(--primary); border-bottom: 1px solid #f1f1f1; }
        .faq-item.active .faq-answer { padding: 25px 30px; max-height: 400px; }
        .faq-item.active .faq-question i { transform: rotate(180deg); background: var(--primary); color: var(--white); }

        footer { background: linear-gradient(to right, var(--dark), #2c3e50); color: var(--white); padding: 80px 5% 30px; position: relative; }
        footer::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(to right, var(--accent), var(--primary)); }
        .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 50px; max-width: 1200px; margin: auto; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 50px; }
        .footer-col .logo { color: var(--white); margin-bottom: 20px; font-size: 32px; height: 100px; display: inline-flex; }
        .footer-col h4 { font-size: 22px; margin-bottom: 25px; color: var(--accent); font-weight: 800; }
        .footer-col ul { list-style: none; padding:0; margin:0; }
        .footer-col ul li { margin-bottom: 15px; display: flex; align-items: center; gap: 15px; color: #cbd5e1; }
        .footer-col ul li a { color: #cbd5e1; text-decoration: none; transition: var(--transition); }
        .footer-col ul li a:hover { color: var(--accent); padding-right: 10px; }
        .footer-col ul li i { color: var(--accent); width: 35px; height: 35px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .copyright { text-align: center; padding-top: 30px; color: #94a3b8; font-size: 15px; }

        .reveal { opacity: 0; transform: translateY(40px); transition: all 0.8s ease-out; }
        .reveal.active { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.1s; }
        .delay-2 { transition-delay: 0.2s; }
        .delay-3 { transition-delay: 0.3s; }

        @media (max-width: 991px) {
            #hero { flex-direction: column; text-align: center; padding-top: 150px; }
            .hero-content { padding-left: 0; margin-bottom: 60px; }
            nav ul { display: none; }
            .steps-container { border-right: none; padding-right: 0; }
            .step-number { right: 50%; transform: translateX(50%); top: -65px; }
            .step-item { margin-top: 80px; padding-right: 0; text-align: center; }
        }
      `}</style>

      <div className="bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
      </div>

      <header id="header">
          <div className="nav-container">
              <a href="#" className="logo"><img src={logo} alt="SKILL UP" style={{ height: '100%', objectFit: 'contain' }} /></a>
              <nav>
                  <ul>
                      <li><a href="#hero">الرئيسية</a></li>
                      <li><a href="#about">عن المنصة</a></li>
                      <li><a href="#benefits">المزايا</a></li>
                      <li><a href="#steps">خطوات الربط</a></li>
                      <li><a href="#services">الخدمات</a></li>
                      <li><a href="#faq">الأسئلة الشائعة</a></li>
                  </ul>
              </nav>
              <a href="#contact" className="btn-main">تواصل معنا</a>
          </div>
      </header>

      <section id="hero">
          <div className="hero-content reveal">
              <h1>حل التوطين الأمثل <br/>من خلال <span>العمل عن بعد</span></h1>
              <p>منصة متكاملة لإدارة ومراقبة أداء العاملين عن بعد، مرخصة ومعتمدة من وزارة الموارد البشرية والتنمية الاجتماعية، تضمن الحقوق الكاملة للمنشآت والباحثين عن عمل.</p>
              <a href="#steps" className="btn-main"><i className="fas fa-rocket ml-2"></i> ابدأ ربط موظفيك الآن</a>
          </div>
          <div className="hero-image reveal delay-1">
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80" alt="موظف يعمل عن بعد SKILL UP" />
          </div>
      </section>

      <section id="about" className="section-padding">
          <div className="section-header reveal">
              <h2>المنصة ورؤية المملكة 2030</h2>
          </div>
          <div className="grid-3">
              <div className="card-box reveal delay-1">
                  <i className="fas fa-bullseye"></i>
                  <h3>الهدف الاستراتيجي</h3>
                  <p>تزويد المنشآت بكافة الحلول الاستشارية والاستراتيجية لمواءمة الخدمات التقنية مع متطلبات الأعمال، وتحليل المشكلات لضمان الجودة والاستمرارية تماشياً مع رؤية المملكة 2030.</p>
              </div>
              <div className="card-box reveal delay-2">
                  <i className="fas fa-eye"></i>
                  <h3>رؤيتنا</h3>
                  <p>أن نكون من الكيانات الرائدة في المجال التقني والرقمي، وأن نترك بصمة واضحة ومميزة في دعم وتطوير الحلول المبتكرة للأفراد والمستثمرين والشركات.</p>
              </div>
              <div className="card-box reveal delay-3">
                  <i className="fas fa-paper-plane"></i>
                  <h3>رسالتنا</h3>
                  <p>تقديم خدمات حيوية ومبتكرة بدعم احترافي، وتكييف الأدوات الفنية لربط الكفاءات المؤهلة والباحثين عن العمل مع المنشآت بأقل التكاليف الممكنة.</p>
              </div>
          </div>
      </section>

      <section id="benefits" className="section-padding benefits-container">
          <div className="section-header reveal">
              <h2>أهمية ومزايا تبني العمل عن بعد</h2>
          </div>
          <div className="benefits-wrapper">
              <div className="benefit-card reveal delay-1">
                  <div className="benefit-icon"><i className="fas fa-chart-line"></i></div>
                  <div>
                      <h3>زيادة الإنتاجية بمعدل 30%</h3>
                      <p>أثبتت الدراسات ارتفاع الإنتاجية بنسبة تصل إلى 30% عند بدء فرق العمل بالاعتماد على تطبيقات العمل عن بعد الجماعية.</p>
                  </div>
              </div>
              <div className="benefit-card reveal delay-2">
                  <div className="benefit-icon"><i className="fas fa-smile"></i></div>
                  <div>
                      <h3>تحقيق الرضا الوظيفي</h3>
                      <p>تعزيز سعادة الموظفين النفسية والذهنية، مما يخلق لديهم شعوراً بالانتماء والولاء ويجعلهم سفراء فخورين بالعلامة التجارية.</p>
                  </div>
              </div>
              <div className="benefit-card reveal delay-1">
                  <div className="benefit-icon"><i className="fas fa-wallet"></i></div>
                  <div>
                      <h3>تكاليف أقل للطرفين</h3>
                      <p>توفير ميزانيات تأسيس المكاتب، الأبنية، مصاريف السفر، والانتقالات، مع إدارة مسارات التدريب والتأهيل بالكامل عن بعد وبسهولة.</p>
                  </div>
              </div>
              <div className="benefit-card reveal delay-2">
                  <div className="benefit-icon"><i className="fas fa-shield-virus"></i></div>
                  <div>
                      <h3>ضمان استمرارية الأعمال</h3>
                      <p>تمكين المؤسسات من إدارة أعمالها بكفاءة كاملة وتجنب الخسائر المادية خلال حالات الطوارئ أو الأزمات والكوارث الطبيعية.</p>
                  </div>
              </div>
          </div>
      </section>

      <section id="steps" className="section-padding">
          <div className="section-header reveal">
              <h2>طريقة ربط موظفيك للعمل معك عن بعد</h2>
          </div>
          <div className="steps-container">
              <div className="step-item reveal">
                  <div className="step-number">01</div>
                  <div className="step-content">
                      <h3>تسجيل الموظف في التأمينات</h3>
                      <p>يتم تسجيل الموظف كمشترك رسمي في نظام التأمينات الاجتماعية مع اختيار نوع العمل ليكون (عمل عن بعد).</p>
                  </div>
              </div>
              <div className="step-item reveal">
                  <div className="step-number">02</div>
                  <div className="step-content">
                      <h3>بوابة العمل عن بعد</h3>
                      <p>الدخول المباشر إلى الموقع الرسمي للبوابة الوطنية للعمل عن بعد عبر الرابط <strong>teleworks.sa</strong>.</p>
                  </div>
              </div>
              <div className="step-item reveal">
                  <div className="step-number">03</div>
                  <div className="step-content">
                      <h3>إنشاء الحساب الخاص بالمنشأة</h3>
                      <p>تسجيل حساب جديد كصاحب منشأة داخل البوابة باستخدام رقم المنشأة المعتمد والموثق لدى وزارة الموارد البشرية.</p>
                  </div>
              </div>
              <div className="step-item reveal">
                  <div className="step-number">04</div>
                  <div className="step-content">
                      <h3>اختيار SKILL UP كمزود للخدمة</h3>
                      <p>تسجيل الدخول واختيار منصة <strong style={{ color: 'var(--primary)' }}>Skill Up</strong> كمزود الخدمة المعتمد والمرغوب لربط موظفيك ومتابعة أدائهم.</p>
                  </div>
              </div>
          </div>
      </section>

      <section id="services" className="section-padding">
          <div className="section-header reveal">
              <h2>الخدمات الشاملة المقدمة</h2>
          </div>
          <div className="services-wrapper">
              <div className="service-card reveal delay-1">
                  <div className="service-icon"><i className="fas fa-user-check"></i></div>
                  <h3>إدارة الإنتاجية</h3>
                  <p>قياس الأداء بدقة ومرونة، تتبع الحضور والانصراف اليومي، ساعات العمل الحقيقية، والتقاط لقطات عشوائية من شاشة الموظف للتأكد من مهارات الحاسب الآلي.</p>
              </div>
              <div className="service-card reveal delay-2">
                  <div className="service-icon"><i className="fas fa-desktop"></i></div>
                  <h3>مراقبة الأداء المتقدمة</h3>
                  <p>لوحة تحكم شاملة معتمدة تتيح للمنشأة مراجعة تقارير مفصلة ودقيقة لحظة بلحظة وفي أي وقت، بالكامل من خلال الموبايل أو الأجهزة اللوحية.</p>
              </div>
              <div className="service-card reveal delay-3">
                  <div className="service-icon"><i className="fas fa-briefcase"></i></div>
                  <h3>الحلول الوظيفية</h3>
                  <p>عمليات متخصصة في استقطاب وجذب الموارد البشرية ذات الكفاءة، وإتمام تسجيلهم الرسمي وتأهيلهم لبدء العمل بكفاءة عالية واحترافية.</p>
              </div>
              <div className="service-card reveal delay-1">
                  <div className="service-icon"><i className="fas fa-graduation-cap"></i></div>
                  <h3>التدريب والتطوير</h3>
                  <p>نمتلك طاقماً معتمداً ومؤهلاً بأعلى درجات الخبرة والكفاءة، لتأهيل وتدريب طاقم عملك بالكامل في مختلف المجالات والمسارات المطلوبة.</p>
              </div>
              <div className="service-card reveal delay-2">
                  <div className="service-icon"><i className="fas fa-headset"></i></div>
                  <h3>الدعم الفني والحلول</h3>
                  <p>فريق متميز مخصص ومتاح دائماً للإجابة على جميع استفسارات الشركات في كل ما يخص نظام العمل، وتقديم التحديثات والحلول الإيجابية آلياً.</p>
              </div>
          </div>
      </section>

      <section id="faq" className="section-padding" style={{ background: 'var(--light-bg)' }}>
          <div className="section-header reveal">
              <h2>الأسئلة الشائعة</h2>
          </div>
          <div className="faq-max">
              <div className="faq-item reveal">
                  <div className="faq-question">ما هي الفئات التي يمكنها الانضمام لبرنامج العمل عن بعد؟ <i className="fas fa-chevron-down"></i></div>
                  <div className="faq-answer">برنامج العمل عن بعد متاح ومفتوح لجميع الفئات من الإناث والذكور، وكذلك ذوي الإعاقة.</div>
              </div>
              <div className="faq-item reveal">
                  <div className="faq-question">هل يسجل العاملون عن بعد في نظام التأمينات الاجتماعية؟ <i className="fas fa-chevron-down"></i></div>
                  <div className="faq-answer">نعم، التسجيل في التأمينات الاجتماعية شرط مسبق أساسي. يجب تسجيل العامل كعامل عن بعد (بدوام كامل أو جزئي) قبل التمكن من تسجيله في بوابة العمل عن بعد.</div>
              </div>
              <div className="faq-item reveal">
                  <div className="faq-question">هل يتم احتساب موظف العمل عن بعد في برنامج نطاقات؟ <i className="fas fa-chevron-down"></i></div>
                  <div className="faq-answer">نعم، عملية احتساب العامل عن بعد لا تختلف تماماً عن احتساب العامل التقليدي داخل برنامج نطاقات وتوطين المهن.</div>
              </div>
              <div class="faq-item reveal">
                  <div className="faq-question">هل تتوفر وظائف بنظام الدوام الجزئي والكامل؟ <i className="fas fa-chevron-down"></i></div>
                  <div className="faq-answer">نعم، تتوفر وظائف بدوام كامل وجزئي حسب القرار الوزاري المنظم للعمل عن بعد، ولا يشترط أبداً تطابق الساعات مع أوقات الدوام الاعتيادية للشركة.</div>
              </div>
              <div className="faq-item reveal">
                  <div className="faq-question">هل يشترط إقامة العامل عن بعد داخل أراضي المملكة؟ <i className="fas fa-chevron-down"></i></div>
                  <div className="faq-answer">لا يشترط وجود العامل عن بعد داخل المملكة، حيث يمكن أن يكون بالخارج (كحالة زوجة المبتعث على سبيل المثال).</div>
              </div>
              <div className="faq-item reveal">
                  <div className="faq-question">هل هناك فرق في الترقيات وحساب سنوات الخدمة المعتمدة؟ <i className="fas fa-chevron-down"></i></div>
                  <div className="faq-answer">لا يوجد أي فرق على الإطلاق في الترقيات أو احتساب سنوات الخدمة المعتمدة؛ الفرق الوحيد الفعلي هو مكان أداء العمل.</div>
              </div>
              <div className="faq-item reveal">
                  <div className="faq-question">ما هي الشروط الأساسية للالتحاق ببرنامج العمل عن بعد؟ <i className="fas fa-chevron-down"></i></div>
                  <div className="faq-answer">الشروط هي: أن يكون المتقدم سعودي الجنسية، السن يتراوح من 18 إلى 60 سنة، وإجادة استخدام التقنيات الحديثة. البرنامج لا يتطلب الحصول على شهادات عليا.</div>
              </div>
          </div>
      </section>

      <footer id="contact">
          <div className="footer-grid">
              <div className="footer-col">
                  <a href="#" className="logo"><img src={logo} alt="SKILL UP" style={{ height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} /></a>
                  <p>منصة رائدة متخصصة في ابتكار الحلول التقنية المتقدمة لإدارة الموارد البشرية والعمل عن بعد بكوادر سعودية مؤهلة تدعم النهضة الاقتصادية للمملكة ضمن رؤية 2030.</p>
              </div>
              <div className="footer-col">
                  <h4>روابط سريعة</h4>
                  <ul>
                      <li><a href="#hero"><i className="fas fa-angle-left" style={{ width: 'auto', background: 'none', color: 'var(--accent)' }}></i> الرئيسية</a></li>
                      <li><a href="#about"><i className="fas fa-angle-left" style={{ width: 'auto', background: 'none', color: 'var(--accent)' }}></i> الرؤية والأهداف</a></li>
                      <li><a href="#benefits"><i className="fas fa-angle-left" style={{ width: 'auto', background: 'none', color: 'var(--accent)' }}></i> المزايا للمنشآت</a></li>
                      <li><a href="#faq"><i className="fas fa-angle-left" style={{ width: 'auto', background: 'none', color: 'var(--accent)' }}></i> الأسئلة الشائعة</a></li>
                  </ul>
              </div>
              <div className="footer-col">
                  <h4>بيانات التواصل</h4>
                  <ul>
                      <li><i className="fas fa-map-marker-alt"></i> <span>المملكة العربية السعودية - الرياض</span></li>
                      <li><i className="fas fa-phone-alt"></i> <span dir="ltr">+966 057 939 0369</span></li>
                      <li><i className="fas fa-globe"></i> <span>teleworks.sa</span></li>
                      <li><i className="fas fa-envelope"></i> <span dir="ltr">mabdelaziz@skillup.sa</span></li>
                  </ul>
              </div>
          </div>
          <div className="copyright">
              <p>جميع الحقوق محفوظة لصالح منصة SKILL UP &copy; 2026</p>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;