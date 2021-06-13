import request from '../request/request';
import EventBus from './eventBus';
import Modal from './Modal';

export default class Ticket {
  constructor(id, status, name, created) {
    this.id = id;
    this.status = status;
    this.name = name;
    this.created = created;
    this.main = document.createElement('div');
    this.getTicket();
    this.main.addEventListener('click', (e) => Ticket.onMainClick(e));
  }

  getTicket() {
    this.main.className = 'ticket';
    this.main.dataset.id = this.id;
    const ticketContentContainer = document.createElement('div');
    ticketContentContainer.className = 'ticket-content-container';
    const leftTicketPart = document.createElement('div');
    leftTicketPart.className = 'left-ticket-part';
    const rightTicketPart = document.createElement('div');
    rightTicketPart.className = 'right-ticket-part';
    const ticketDescriptionBlock = document.createElement('div');
    ticketDescriptionBlock.className = 'ticket-description';
    this.main.insertAdjacentElement('afterbegin', ticketContentContainer);
    this.main.insertAdjacentElement('beforeend', ticketDescriptionBlock);
    ticketContentContainer.insertAdjacentElement('afterbegin', leftTicketPart);
    ticketContentContainer.insertAdjacentElement('beforeend', rightTicketPart);
    const statusDiv = document.createElement('div');
    statusDiv.className = 'status';
    statusDiv.dataset.status = this.status;
    const ticketName = document.createElement('div');
    ticketName.className = 'ticket-name';
    ticketName.textContent = this.name;
    leftTicketPart.insertAdjacentElement('afterbegin', statusDiv);
    leftTicketPart.insertAdjacentElement('beforeend', ticketName);
    const ticketCreated = document.createElement('span');
    ticketCreated.className = 'ticket-created';
    ticketCreated.textContent = this.created;
    const ticketChange = document.createElement('button');
    ticketChange.className = 'ticket-change';
    ticketChange.type = 'button';
    ticketChange.innerHTML = '&#9998;';
    const ticketDelete = document.createElement('button');
    ticketDelete.className = 'ticket-delete';
    ticketDelete.type = 'button';
    ticketDelete.innerHTML = '&#10006;';
    rightTicketPart.append(ticketCreated);
    rightTicketPart.append(ticketChange);
    rightTicketPart.append(ticketDelete);
  }

  static onMainClick(e) {
    if (e.target.className === 'ticket-delete') Ticket.deleteTicket(e.target);
    if (e.target.className === 'status') Ticket.onClickChangeStatus(e.target);
    if (e.target.className === 'ticket-name') Ticket.onClickShowTicketDescription(e.target);
    if (e.target.className === 'ticket-change') Ticket.onClickChangeDescription(e.target);
  }

  static onClickChangeDescription(element) {
    const ticket = element.closest('.ticket');
    const { id } = ticket.dataset;
    const modal = new Modal('change', Number(id));
    document.documentElement.append(modal.element);
    modal.open();
    const method = 'GET';
    const queryString = `?method=ticketById&id=${id}`;
    request(method, queryString).then((response) => {
      modal.element.querySelector('#input-task-name').value = response.name;
      modal.element.querySelector('#textarea-task-description').value = response.description;
    });
  }

  static onClickShowTicketDescription(element) {
    const ticket = element.closest('.ticket');
    const ticketDescription = ticket.querySelector('.ticket-description');
    if (ticketDescription.dataset.description === 'active') {
      ticketDescription.textContent = '';
      ticketDescription.dataset.description = 'noActive';
      ticketDescription.style.display = 'none';
    } else {
      const { id } = ticket.dataset;
      const method = 'GET';
      const queryString = `?method=getTicketDescription&id=${id}`;
      request(method, queryString).then((response) => {
        ticket.querySelector('.ticket-description').textContent = response.toString();
        ticketDescription.dataset.description = 'active';
        ticketDescription.style.display = 'block';
        ticketDescription.style.paddingRight = `${ticket.querySelector('.right-ticket-part')
          .getBoundingClientRect().width + 30}px`;
      });
    }
  }

  static onClickChangeStatus(element) {
    const ticket = element.closest('.ticket');
    const { id } = ticket.dataset;
    const method = 'GET';
    const queryString = `?method=changeTicketStatus&id=${id}`;
    request(method, queryString).then((response) => {
      EventBus.publish('change ticket status', response);
    });
  }

  static deleteTicket(element) {
    const ticket = element.closest('.ticket');
    const { id } = ticket.dataset;
    const modal = new Modal('delete', Number(id));
    document.documentElement.append(modal.element);
    modal.open();
  }
}
