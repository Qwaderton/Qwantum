/**
 * QWANTUM.JS - JavaScript компоненты для фреймворка Qwantum
 * Включает: модальные окна, бургер-меню, анимации появления
 */

class Qwantum {
  constructor() {
    this.modals = new Map();
    this.activeModal = null;
    this.mobileMenuActive = false;
    
    this.init();
  }

  /**
   * Инициализация всех компонентов
   */
  init() {
    this.initModals();
    this.initBurgerMenu();
    this.initAnimations();
    this.bindEvents();
  }

  /**
   * Инициализация модальных окон
   */
  initModals() {
    // Находим все модальные окна
    const modals = document.querySelectorAll('.qw-modal');
    
    modals.forEach(modal => {
      const id = modal.id;
      if (id) {
        this.modals.set(id, modal);
        
        // Добавляем обработчик закрытия по клику на оверлей
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeModal(id);
          }
        });
        
        // Обработчик для кнопки закрытия
        const closeBtn = modal.querySelector('.qw-modal_close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            this.closeModal(id);
          });
        }
      }
    });

    // Добавляем обработчики для кнопок открытия модальных окон
    const modalTriggers = document.querySelectorAll('[data-qw-modal]');
    modalTriggers.forEach(trigger => {
      const modalId = trigger.getAttribute('data-qw-modal');
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal(modalId);
      });
    });
  }

  /**
   * Открыть модальное окно
   * @param {string} modalId - ID модального окна
   */
  openModal(modalId) {
    const modal = this.modals.get(modalId);
    if (!modal) return;

    // Закрываем текущее модальное окно, если есть
    if (this.activeModal) {
      this.closeModal(this.activeModal);
    }

    // Открываем новое модальное окно
    modal.classList.add('qw-active');
    document.body.style.overflow = 'hidden';
    this.activeModal = modalId;

    // Фокус на модальном окне для accessibility
    modal.focus();
    
    // Вызываем событие открытия
    this.dispatchEvent('qw:modal:open', { modalId, modal });
  }

  /**
   * Закрыть модальное окно
   * @param {string} modalId - ID модального окна
   */
  closeModal(modalId) {
    const modal = this.modals.get(modalId);
    if (!modal) return;

    modal.classList.remove('qw-active');
    document.body.style.overflow = '';
    
    if (this.activeModal === modalId) {
      this.activeModal = null;
    }
    
    // Вызываем событие закрытия
    this.dispatchEvent('qw:modal:close', { modalId, modal });
  }

  /**
   * Закрыть все модальные окна
   */
  closeAllModals() {
    this.modals.forEach((modal, modalId) => {
      this.closeModal(modalId);
    });
  }

  /**
   * Инициализация бургер-меню
   */
  initBurgerMenu() {
    const burger = document.querySelector('.qw-burger');
    const mobileNav = document.querySelector('.qw-nav-mobile');
    const overlay = document.querySelector('.qw-overlay');

    if (!burger || !mobileNav) return;

    // Создаем оверлей, если его нет
    if (!overlay) {
      const overlayEl = document.createElement('div');
      overlayEl.className = 'qw-overlay';
      document.body.appendChild(overlayEl);
    }

    const overlayElement = document.querySelector('.qw-overlay');

    burger.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Закрытие по клику на оверлей
    if (overlayElement) {
      overlayElement.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // Закрытие по клику на ссылки в меню
    const mobileLinks = mobileNav.querySelectorAll('.qw-nav_link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });
  }

  /**
   * Переключить состояние мобильного меню
   */
  toggleMobileMenu() {
    if (this.mobileMenuActive) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  /**
   * Открыть мобильное меню
   */
  openMobileMenu() {
    const burger = document.querySelector('.qw-burger');
    const mobileNav = document.querySelector('.qw-nav-mobile');
    const overlay = document.querySelector('.qw-overlay');

    if (burger) burger.classList.add('qw-active');
    if (mobileNav) mobileNav.classList.add('qw-active');
    if (overlay) overlay.classList.add('qw-active');
    
    document.body.style.overflow = 'hidden';
    this.mobileMenuActive = true;
    
    this.dispatchEvent('qw:menu:open', { mobileNav });
  }

  /**
   * Закрыть мобильное меню
   */
  closeMobileMenu() {
    const burger = document.querySelector('.qw-burger');
    const mobileNav = document.querySelector('.qw-nav-mobile');
    const overlay = document.querySelector('.qw-overlay');

    if (burger) burger.classList.remove('qw-active');
    if (mobileNav) mobileNav.classList.remove('qw-active');
    if (overlay) overlay.classList.remove('qw-active');
    
    document.body.style.overflow = '';
    this.mobileMenuActive = false;
    
    this.dispatchEvent('qw:menu:close', { mobileNav });
  }

  /**
   * Инициализация анимаций появления элементов
   */
  initAnimations() {
    const animatedElements = document.querySelectorAll('.qw-animate-fade-up');
    
    if (!animatedElements.length) return;

    // Создаем наблюдателя для Intersection Observer API
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('qw-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Наблюдаем за всеми анимированными элементами
    animatedElements.forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Привязка глобальных обработчиков событий
   */
  bindEvents() {
    // Закрытие модальных окон по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.activeModal) {
          this.closeModal(this.activeModal);
        }
        if (this.mobileMenuActive) {
          this.closeMobileMenu();
        }
      }
    });

    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
      // Закрываем мобильное меню при увеличении экрана
      if (window.innerWidth > 768 && this.mobileMenuActive) {
        this.closeMobileMenu();
      }
    });
  }

  /**
   * Создание и отправка пользовательского события
   * @param {string} eventName - Название события
   * @param {Object} detail - Дополнительные данные
   */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { 
      detail,
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  /**
   * Создать модальное окно программно
   * @param {Object} options - Настройки модального окна
   * @returns {string} ID созданного модального окна
   */
  createModal(options = {}) {
    const {
      id = 'qw-modal-' + Date.now(),
      title = 'Модальное окно',
      content = '',
      size = 'md',
      closable = true,
      footer = null
    } = options;

    // Создаем HTML структуру модального окна
    const modalHTML = `
      <div class="qw-modal qw-modal-${size}" id="${id}">
        <div class="qw-modal_content">
          <div class="qw-modal_header">
            <h3 class="qw-modal_title">${title}</h3>
            ${closable ? '<button class="qw-modal_close" type="button">&times;</button>' : ''}
          </div>
          <div class="qw-modal_body">
            ${content}
          </div>
          ${footer ? `<div class="qw-modal_footer">${footer}</div>` : ''}
        </div>
      </div>
    `;

    // Добавляем модальное окно в DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Регистрируем новое модальное окно
    const modalElement = document.getElementById(id);
    this.modals.set(id, modalElement);

    // Добавляем обработчики событий
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) {
        this.closeModal(id);
      }
    });

    if (closable) {
      const closeBtn = modalElement.querySelector('.qw-modal_close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeModal(id);
        });
      }
    }

    return id;
  }

  /**
   * Удалить модальное окно
   * @param {string} modalId - ID модального окна
   */
  destroyModal(modalId) {
    const modal = this.modals.get(modalId);
    if (!modal) return;

    // Закрываем модальное окно, если оно открыто
    this.closeModal(modalId);
    
    // Удаляем из DOM
    modal.remove();
    
    // Удаляем из коллекции
    this.modals.delete(modalId);
    
    this.dispatchEvent('qw:modal:destroy', { modalId });
  }

  /**
   * Показать уведомление
   * @param {Object} options - Настройки уведомления
   */
  showNotification(options = {}) {
    const {
      message = 'Уведомление',
      type = 'info', // info, success, warning, error
      duration = 3000,
      closable = true
    } = options;

    // Создаем контейнер для уведомлений, если его нет
    let container = document.querySelector('.qw-notifications');
    if (!container) {
      container = document.createElement('div');
      container.className = 'qw-notifications';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(container);
    }

    // Создаем уведомление
    const notification = document.createElement('div');
    const notificationId = 'notification-' + Date.now();
    notification.id = notificationId;
    notification.className = `qw-notification qw-notification-${type}`;
    
    // Стили для уведомления
    notification.style.cssText = `
      background: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      max-width: 300px;
      transform: translateX(100%);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    `;

    // Цвета в зависимости от типа
    const colors = {
      info: '#333',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    };

    notification.style.borderLeft = `4px solid ${colors[type] || colors.info}`;

    // Содержимое уведомления
    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    messageEl.style.flex = '1';
    notification.appendChild(messageEl);

    // Кнопка закрытия
    if (closable) {
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      closeBtn.addEventListener('click', () => {
        this.hideNotification(notificationId);
      });
      notification.appendChild(closeBtn);
    }

    container.appendChild(notification);

    // Анимация появления
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Автоматическое скрытие
    if (duration > 0) {
      setTimeout(() => {
        this.hideNotification(notificationId);
      }, duration);
    }

    this.dispatchEvent('qw:notification:show', { 
      notificationId, 
      message, 
      type 
    });

    return notificationId;
  }

  /**
   * Скрыть уведомление
   * @param {string} notificationId - ID уведомления
   */
  hideNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (!notification) return;

    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';

    setTimeout(() => {
      notification.remove();
    }, 300);

    this.dispatchEvent('qw:notification:hide', { notificationId });
  }

  /**
   * Утилиты для работы с классами
   */
  static utils = {
    /**
     * Добавить класс с анимацией появления
     * @param {Element} element - Элемент
     */
    fadeIn(element) {
      element.classList.add('qw-animate-fade-up');
      setTimeout(() => {
        element.classList.add('qw-visible');
      }, 100);
    },

    /**
     * Плавное скролление к элементу
     * @param {string|Element} target - Селектор или элемент
     * @param {number} offset - Отступ сверху
     */
    scrollTo(target, offset = 0) {
      const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;
      
      if (!element) return;

      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    },

    /**
     * Дебаунс функции
     * @param {Function} func - Функция для дебаунса
     * @param {number} wait - Время ожидания в мс
     * @returns {Function} Функция с дебаунсом
     */
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Троттлинг функции
     * @param {Function} func - Функция для троттлинга
     * @param {number} limit - Лимит времени в мс
     * @returns {Function} Функция с троттлингом
     */
    throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    }
  };
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  window.qw = new Qwantum();
});

// Экспорт для использования в модульных системах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Qwantum;
}