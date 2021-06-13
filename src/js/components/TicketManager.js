import request from '../request/request';
import EventBus from './eventBus';
import Ticket from './Ticket';
import Modal from './Modal';

export default class TicketManager {
  constructor(elem) {
    if (typeof elem === 'string') {
      this.container = document.querySelector(elem);
    }
    this.container = elem;
    this.ticketsContainer = this.container.querySelector('.tickets-container');
    this.tickets = [];
    this.modal = null;
    this.registerEvents();
    this.init();
  }

  init() {
    this.ticketsContainer.innerHTML = '';
    const method = 'GET';
    const queryString = '?method=allTickets';
    const arrayTickets = request(method, queryString);
    arrayTickets.then((array) => {
      array.forEach((elem) => {
        const ticket = new Ticket(elem.id, elem.status, elem.name, elem.created);
        this.tickets.push(ticket);
        this.ticketsContainer.append(ticket.main);
      });
    });
  }

  registerEvents() {
    EventBus.subscribe('delete ticket', this.deleteTicket.bind(this));
    EventBus.subscribe('add new ticket', this.addedNewTicket.bind(this));
    EventBus.subscribe('change ticket status', this.changeTicketStatus.bind(this));
    EventBus.subscribe('change ticket', this.changeTicket.bind(this));

    this.container.querySelector('.add-task-button')
      .addEventListener('click', () => this.onClickAddTask());
  }

  onClickAddTask() {
    this.modal = new Modal('create');
    this.container.append(this.modal.element);
    this.modal.open();
  }

  reDrawTickets() {
    this.tickets.forEach((ticket) => {
      this.ticketsContainer.append(ticket.main);
    });
  }

  deleteTicket(id) {
    this.tickets.forEach((elem, index) => {
      if (elem.id === id) {
        elem.main.remove();
        this.tickets.splice(index, 1);
      }
      this.reDrawTickets();
    });
  }

  changeTicket(object) {
    this.tickets.forEach((elem) => {
      if (elem.id === Number(object.id)) {
        const ticket = elem;
        ticket.main.querySelector('.ticket-name').textContent = object.name;
      }
    });
    this.reDrawTickets();
  }

  changeTicketStatus(object) {
    this.tickets.forEach((elem) => {
      if (elem.id === object.id) {
        const ticket = elem;
        ticket.main.querySelector('.status').dataset.status = object.status;
      }
    });
    this.reDrawTickets();
  }

  addedNewTicket(object) {
    this.modal.delete();
    this.modal = null;
    const ticket = new Ticket(object.id, object.status, object.name, object.created);
    this.tickets.push(ticket);
    this.reDrawTickets();
  }
}
