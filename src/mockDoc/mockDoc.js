export const MockDoc = () => `
    <div class="word-document">
      <div class="word-page" data-page="1">
        <div class="word-header">
          <p class="word-company">ГК «УРАЛЬСКАЯ СТАЛЬ»</p>
          <p class="word-date">15 июня 2025 г.</p>
        </div>
        
        <h1 class="word-title">ТЕХНИЧЕСКОЕ ЗАДАНИЕ</h1>
        <p class="word-subtitle">на разработку системы управления производственными процессами</p>
        
        <div class="word-section" data-section="1">
          <h2 class="word-heading">1. Общие положения</h2>
          <p class="word-paragraph">Данное техническое задание определяет требования к разработке <span data-error="1" class="error-text" data-section="1">автоматизированной системе управления</span> производственными процессами металлургического комбината «Уральская Сталь».</p>
          <p class="word-paragraph">Документ является основным руководством для подрядчика при выполнении работ по созданию, внедрению и сопровождению системы.</p>
        </div>
        
        <div class="word-section" data-section="2">
          <h2 class="word-heading">2. Назначение системы</h2>
          <p class="word-paragraph">Система предназначена для <span data-error="2" class="error-text" data-section="2">оптимизации работы</span> производственных подразделений и <span data-error="3" class="error-text" data-section="2">увеличения эффективности</span> деятельности предприятия.</p>
          <p class="word-paragraph">Основные цели внедрения:</p>
          <ul class="word-list">
            <li>Автоматизация учета производственных операций</li>
            <li>Снижение времени простоя оборудования</li>
            <li>Повышение качества выпускаемой продукции</li>
          </ul>
        </div>
        
        <div class="word-section" data-section="3">
          <h2 class="word-heading">3. Требования к функциональности</h2>
          <p class="word-paragraph"><strong>3.1</strong> Система должна обеспечивать <span data-error="4" class="error-text" data-section="3">круглосуточный мониторинг</span> производственных показателей с возможностью формирования оперативных отчетов.</p>
          <p class="word-paragraph"><strong>3.2</strong> Необходимо реализовать модуль <span data-error="5" class="error-text" data-section="3">аналитики и отчетности</span> с возможностью выгрузки данных в различные форматы.</p>
          <p class="word-paragraph"><strong>3.3</strong> Требуется интеграция с существующими системами предприятия через стандартные протоколы обмена данными.</p>
        </div>
        
        <div class="word-page-break"></div>
        
        <div class="word-section" data-section="4">
          <h2 class="word-heading">4. Технические требования</h2>
          <p class="word-paragraph"><strong>4.1</strong> Система должна работать в режиме <span data-error="6" class="error-text" data-section="4">24/7</span> с допустимым временем простоя не более 0.1% в год.</p>
          <p class="word-paragraph"><strong>4.2</strong> Требования к производительности:</p>
          <table class="word-table">
            <tr>
              <th>Параметр</th>
              <th>Значение</th>
            </tr>
            <tr>
              <td>Время отклика интерфейса</td>
              <td>&lt; 2 сек</td>
            </tr>
            <tr>
              <td>Количество одновременных пользователей</td>
              <td>&gt; 500</td>
            </tr>
            <tr>
              <td>Объем обрабатываемых данных</td>
              <td>&gt; 1 ТБ/сутки</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `