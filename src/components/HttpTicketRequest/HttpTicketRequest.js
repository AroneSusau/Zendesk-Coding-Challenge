'use-strict'
const fetch = require('node-fetch')
const fetchHeaders = require('fetch-headers')
const LoginCredentials = require('../LoginCredential/LoginCredentials')
const Ticket = require('../Ticket/Ticket')
const console = require('console')
// Disables debug output in testing environment
console.log = process.env.NODE_ENV != 'test' ? console.log : function() {}

class HttpTicketRequest {
  /**
   * HttpTicketRequest Class
   */
  constructor() {
    this.headers = null
    this.login = null
    this.url = ''
  }

  /**
   * Template fetch request.
   *
   * @returns {Promise} Returns Promise from fetch request.
   */
  async templateFetchRequest() {
    return fetch(this.url, { headers: this.headers })
      .then(this.handlesErrors)
      .then(result => result.json())
  }

  /**
   * Basic error handling for the fetch request to the Zendesk API.
   *
   * @param {Object} response Response returned from fetch request to the Zendesk API.
   */
  handlesErrors(response) {
    if (!response.ok) {
      console.log('\x1b[31mAPI Request Issue..')
      switch (response.status) {
        case 401:
          console.log(response.statusText, ": Couldn't authenticate you\x1b[0m")
          break
        case 404:
          console.log(response.statusText, ': Ticket not found\x1b[0m')
          break
        case 400:
          console.log(response.statusText, ': Invalid Ticket Id\x1b[0m')
          break
        default:
          console.log(response.statusText, '\x1b[0m')
      }
    }

    return response
  }

  /**
   * Sets login credentials and authorisation header option.
   *
   * @param {String} username Zendesk account username.
   * @param {String} password Zendesk account password.
   */
  setLoginCredentialsAndHeaders(username, password) {
    this.login = new LoginCredentials(username, password)
    this.headers = new fetchHeaders()
    this.headers.append('Authorization', 'Basic ' + this.login.base64)
    this.headers.append('method', 'POST')
  }

  /**
   * Formats a list of tickets retrieved from the Zendesk API into the Ticket data model.
   *
   * @param {Array} ticketsList Tickets list retrieved from Zendesk API.
   * @returns {Array} Returns array with Ticket objects.
   */
  formatTickets(ticketsList) {
    return ticketsList.map(ticketObject => {
      return new Ticket(ticketObject)
    })
  }

  /**
   * Makes a fetch request to the Zendesk API for all tickets.
   *
   * @param {Mixed} nextUrl URL for the next page of tickets.
   *
   * @returns {Mixed} Returns a list of tickets from the Zendesk API or null if an error occurs.
   */
  async retrieveAllTickets(nextUrl) {
    // Set url
    nextUrl ? (this.url = nextUrl) : this.setUrlForAllTickets()
    // Make fetch request
    let apiResponse = await this.templateFetchRequest()
    if (apiResponse.error) {
      return null
    } else {
      // Add next/previous page and count to result object
      let result = this.formatTickets(apiResponse.tickets)
      result.nextPage = apiResponse.next_page
      result.previousPage = apiResponse.previous_page
      result.page = this.getPageNumberFromUrl()
      result.count = apiResponse.count
      return result
    }
  }

  /**
   * Fetch request to Zendesk API for a single tickets by its id.
   *
   * @param {Number} ticketId Id for ticket.
   *
   * @returns {Mixed} Returns a list of tickets from the Zendesk API or null if an error occurs.
   */
  async retrieveTicketById(ticketId) {
    this.setUrlForSingleTicket(ticketId)
    let apiResponse = await this.templateFetchRequest()
    return apiResponse.error ? null : new Ticket(apiResponse.ticket)
  }

  /**
   * Sets the url to retrieve all tickets from the Zendesk API.
   */
  setUrlForAllTickets() {
    this.url = `https://aronesusau.zendesk.com/api/v2/tickets.json?per_page=50`
  }

  /**
   * Sets the url to retrieve a single ticket by its id from the Zendesk API.
   *
   * @param {number} id Id of ticket to be requested.
   */
  setUrlForSingleTicket(id) {
    this.url = `https://aronesusau.zendesk.com/api/v2/tickets/${id}.json`
  }

  /**
   * Uses a regex search function to find and return the current page number from URL.
   *
   * @returns {String} Page number of the current URL.
   */
  getPageNumberFromUrl() {
    let page = this.url.match(/\?page=[0-9]*[0-9]/g)
    return page ? page[0].split('=')[1] - 1 : 0
  }
}

module.exports = HttpTicketRequest