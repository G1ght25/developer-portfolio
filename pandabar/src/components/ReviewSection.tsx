/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  rollName: string;
  comment: string;
  avatarText: string;
}

const REVIEWS_DATA: Review[] = [
  {
    id: 'review-1',
    author: 'Александр К.',
    date: '10.07.2026',
    rating: 5,
    rollName: 'Сет Мега Панда',
    comment: 'Ребят, это просто разрыв! Рыба на Филадельфии свежайшая и толстый-толстый срез лосося. В других местах рис просвечивает, а тут прям премиально! И упаковано в стильные черные коробки с золотом. Будем заказывать еще!',
    avatarText: 'АК'
  },
  {
    id: 'review-2',
    author: 'Дарья П.',
    date: '08.07.2026',
    rating: 5,
    rollName: 'Темпура Лосось Лава',
    comment: 'Горячие роллы приехали реально горячими! Курьер долетел за 35 минут. Корочка темпура хрустит, соус лава нежнейший. Личный кабинет очень удобный, залипла на шаги повара в реальном времени 😂',
    avatarText: 'ДП'
  },
  {
    id: 'review-3',
    author: 'Евгений М.',
    date: '03.07.2026',
    rating: 5,
    rollName: 'Пепперони Классик',
    comment: 'Заказывали пиццу и удон на обед в офис. Удон сытный, много курицы и овощей. Тесто у пиццы хрустящее, сыр тянется как надо. Суши Панда держит марку! Огромное спасибо оператору за быструю обратную связь.',
    avatarText: 'ЕМ'
  }
];

export default function ReviewSection({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [userRoll, setUserRoll] = useState('');
  const [userName, setUserName] = useState('');
  const [allReviews, setAllReviews] = useState<Review[]>(REVIEWS_DATA);
  const [showForm, setShowForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allReviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allReviews.length) % allReviews.length);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userComment) return;

    const newReview: Review = {
      id: `review-${Date.now()}`,
      author: userName,
      date: new Date().toLocaleDateString(),
      rating: userRating,
      rollName: userRoll || 'Любимое блюдо',
      comment: userComment,
      avatarText: userName.substring(0, 2).toUpperCase()
    };

    setAllReviews([newReview, ...allReviews]);
    setCurrentIndex(0);
    setUserName('');
    setUserComment('');
    setUserRoll('');
    setUserRating(5);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowForm(false);
    }, 2500);
  };

  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 border-t transition-colors ${
      theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-panda-dark border-white/5 text-white'
    }`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left column: Title and Slider controls */}
        <div className="lg:col-span-5 flex flex-col gap-5 text-center lg:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-panda-orange">Отзывы наших гостей</span>
          <h2 className={`font-display text-3xl sm:text-4xl font-normal italic tracking-tight leading-tight ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
            Почему выбирают <br />
            <span className="text-panda-orange">Суши Панда</span>
          </h2>
          <p className={`text-sm max-w-md mx-auto lg:mx-0 ${theme === 'light' ? 'text-zinc-600' : 'text-white/50'}`}>
            Мы читаем каждый отзыв и постоянно улучшаем качество наших роллов, пиццы и сервиса. Оставьте свой голос и станьте частью нашей семьи!
          </p>

          <div className="flex items-center justify-center lg:justify-start gap-4 mt-2">
            <button
              onClick={handlePrev}
              className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                theme === 'light' ? 'border-zinc-300 hover:bg-zinc-200 text-zinc-700' : 'border-white/10 hover:bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className={`text-xs font-mono ${theme === 'light' ? 'text-zinc-500' : 'text-white/30'}`}>
              {currentIndex + 1} / {allReviews.length}
            </span>
            <button
              onClick={handleNext}
              className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                theme === 'light' ? 'border-zinc-300 hover:bg-zinc-200 text-zinc-700' : 'border-white/10 hover:bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 px-6 py-3 rounded-xl border border-panda-orange/20 text-panda-orange font-bold text-xs hover:bg-panda-orange/5 transition-all self-center lg:self-start cursor-pointer"
          >
            {showForm ? 'Закрыть отзыв' : 'Оставить отзыв'}
          </button>
        </div>

        {/* Right column: Active Review and Review Add form */}
        <div className="lg:col-span-7 relative min-h-[250px] flex items-center justify-center">
          
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.form
                key="review-form"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                onSubmit={handleAddReview}
                className={`w-full rounded-3xl border p-6 md:p-8 shadow-2xl space-y-4 ${
                  theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-panda-charcoal border-white/10 text-white'
                }`}
              >
                <h4 className={`font-display font-black text-sm ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Поделитесь впечатлениями</h4>
                
                {submitSuccess ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-3 orange-glow-strong">
                      <Check className="h-5 w-5 stroke-[3]" />
                    </div>
                    <p className={`text-sm font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Спасибо за ваш отзыв!</p>
                    <p className={`text-xs mt-1 ${theme === 'light' ? 'text-zinc-500' : 'text-white/40'}`}>Он появится на сайте после быстрой проверки.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Ваше Имя"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className={`w-full h-10 px-3.5 rounded-xl border text-xs focus:outline-none focus:border-panda-orange ${
                            theme === 'light' ? 'bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400' : 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                          }`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Что заказывали? (ролл, сет)"
                          value={userRoll}
                          onChange={(e) => setUserRoll(e.target.value)}
                          className={`w-full h-10 px-3.5 rounded-xl border text-xs focus:outline-none focus:border-panda-orange ${
                            theme === 'light' ? 'bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400' : 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold ${theme === 'light' ? 'text-zinc-700' : 'text-white/60'}`}>Оценка:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className="p-1 text-panda-gold hover:scale-110 cursor-pointer transition-all"
                          >
                            <Star className={`h-4 w-4 ${star <= userRating ? 'fill-panda-gold' : theme === 'light' ? 'text-zinc-300' : 'text-white/20'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <textarea
                        required
                        placeholder="Опишите ваши впечатления (вкус, доставка, обслуживание)..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        className={`w-full h-24 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-panda-orange resize-none ${
                          theme === 'light' ? 'bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400' : 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 rounded-xl bg-panda-orange hover:bg-panda-orange-hover text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      Отправить отзыв
                    </button>
                  </>
                )}
              </motion.form>
            ) : (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`w-full rounded-3xl border p-6 md:p-8 shadow-xl relative ${
                  theme === 'light' ? 'bg-white border-zinc-200 text-zinc-900 shadow-md' : 'bg-panda-charcoal/40 border-white/5 text-white shadow-xl'
                }`}
              >
                <div className={`flex items-center justify-between gap-4 border-b pb-4 mb-4 ${theme === 'light' ? 'border-zinc-200' : 'border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-panda-orange/20 to-panda-gold/20 font-bold text-xs text-panda-orange font-display">
                      {allReviews[currentIndex].avatarText}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{allReviews[currentIndex].author}</h4>
                      <p className={`text-[10px] mt-0.5 ${theme === 'light' ? 'text-zinc-500' : 'text-white/30'}`}>Опубликовано {allReviews[currentIndex].date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < allReviews[currentIndex].rating ? 'fill-panda-gold text-panda-gold' : 'text-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] font-bold text-panda-orange bg-panda-orange/10 px-2 py-0.5 rounded-md">
                    🎯 Рекомендует: {allReviews[currentIndex].rollName}
                  </span>
                </div>

                <p className="text-xs text-white/70 leading-relaxed italic">
                  "{allReviews[currentIndex].comment}"
                </p>

                <MessageSquare className="absolute bottom-6 right-6 h-10 w-10 text-white/3 opacity-30 pointer-events-none" />
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
