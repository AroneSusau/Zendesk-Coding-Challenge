'use-strict'
const Ticket = require('../modules/Ticket')

describe('Ticket', () => {
  it('HAPPY PATH: formats the tickets into the correct structure when provided an unformatted ticket object.', () => {
    const mockTicket = { testAttribute: null }
    expect(new Ticket(mockTicket)).toEqual({
      id: 0,
      subject: 'None',
      description: 'None',
      requesterId: 0
    })
  })

  it('HAPPY PATH: should not change the tickets attributes value if the values are not null', () => {
    const mockTicket = {
      id: 123,
      subject: 'Hello World!',
      description: 'foo bar',
      requester_id: 123123
    }
    expect(new Ticket(mockTicket)).toEqual({
      id: 123,
      subject: 'Hello World!',
      description: 'foo bar',
      requesterId: 123123
    })
  })

  it('returns a Ticket object with default attributes when the constructor is passed an invalid value', () => {
    expect(new Ticket(undefined)).toEqual({
      id: 0,
      subject: 'None',
      description: 'None',
      requesterId: 0
    })
  })
})
