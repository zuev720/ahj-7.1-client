import request from '../request/request';
import EventBus from './eventBus';

export default class Modal {
  constructor(type, id = null) {
    this.type = type;
    this.idTicket = id;
    this.element = document.createElement('aside');
    this.init();
    this.registerEvents();
  }

  init() {
    if (this.type === 'create') this.modalCreate();
    if (this.type === 'change') this.modalChange();
    if (this.type === 'delete') this.modalTicketDelete();
  }

  getModal() {
    this.element.className = 'modal-add-task';
    const headerModal = document.createElement('h5');
    headerModal.className = 'header-modal-add-task';
    const form = document.createElement('form');
    this.element.insertAdjacentElement('afterbegin', headerModal);
    this.element.insertAdjacentElement('beforeend', form);
    form.innerHTML = `<label for="input-task-name">Краткое описание</label>
    <input id="input-task-name" type="text" name="name" required>
    <label class="label-for-textarea" for="textarea-task-description">Подробное описание</label>
    <textarea id="textarea-task-description" name="description" required></textarea>
    <div class="wrapper-buttons-modal-task">
      <button type="button" class="button-cancel-task-modal">Отмена</button>
      <button type="submit" class="button-add-task-modal">Ok</button>
    </div>`;
  }

  modalChange() {
    this.getModal();
    this.element.querySelector('.header-modal-add-task').textContent = 'Изменить тикет';
    this.element.querySelector('form').className = 'change-ticket-form';
  }

  modalCreate() {
    this.getModal();
    this.element.querySelector('.header-modal-add-task').textContent = 'Добавить тикет';
    this.element.querySelector('form').className = 'add-ticket-form';
  }

  modalTicketDelete() {
    this.element.className = 'modal-delete-ticket';
    this.element.innerHTML = `
    <h5 class="header-modal-delete-ticket">Удалить тикет</h5>
    <p class="ticket-delete-modal-text">Вы действительно хотите удалить тикет? Это действие необратимо.</p>
    <div class="buttons-block-delete-modal">
      <div>
        <button class="button-modal-delete-ticket-cancel">Отмена</button>
        <button class="button-modal-delete-ticket-agree">Ok</button>
      </div>
    </div>`;
  }

  registerEvents() {
    if (this.type === 'delete') {
      this.element.querySelector('.button-modal-delete-ticket-cancel')
        .addEventListener('click', () => this.delete());
      this.element.querySelector('.button-modal-delete-ticket-agree')
        .addEventListener('click', () => this.onClickTicketDelete());
    } else {
      this.element.querySelector('form').addEventListener('submit', (e) => {
        if (e.currentTarget.className === 'add-ticket-form') Modal.onSubmitAddTicket(e);
        if (e.currentTarget.className === 'change-ticket-form') this.onSubmitChangeTicket(e);
      });

      this.element.querySelector('.button-cancel-task-modal')
        .addEventListener('click', () => this.delete());
    }
  }

  open() {
    this.element.style.left = `${Math.round(document.documentElement.clientWidth / 2 - this.element.offsetWidth / 2)}px`;
    this.element.style.top = `${Math.round(document.documentElement.clientHeight / 2 - this.element.offsetHeight / 2)}px`;
  }

  onSubmitChangeTicket(e) {
    e.preventDefault();
    const method = 'POST';
    const queryString = '?method=changeTicket';
    const params = `${[...e.target.elements]
      .filter(({ name }) => name)
      .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join('&')}&id=${this.idTicket}`;
    request(method, queryString, params).then((response) => {
      EventBus.publish('change ticket', response);
      this.delete();
    });
  }

  static onSubmitAddTicket(e) {
    e.preventDefault();
    const params = [...e.target.elements]
      .filter(({ name }) => name)
      .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join('&');
    const queryString = '?method=createTicket';
    request('POST', queryString, params).then((response) => {
      EventBus.publish('add new ticket', response);
    });
  }

  onClickTicketDelete() {
    const method = 'POST';
    const queryString = '?method=deleteTicket';
    const params = `id=${this.idTicket}`;
    request(method, queryString, params).then((response) => {
      EventBus.publish('delete ticket', Number(response));
    });
    this.delete();
  }

  delete() {
    this.element.remove();
  }
}
