'use strict'

const {expect} = require('chai')
const util = require('../../../lib/util')

describe('util', () => {
  describe('parsePostgresConnectionString', () => {
    it('correctly parses relative connection strings', () => {
      const connString = 'myapp/my_database_name'
      const parsed = util.parsePostgresConnectionString(connString)

      expect(parsed.database).to.equal('myapp/my_database_name')
      expect(parsed.host).to.equal('')
      expect(parsed.port).to.equal(undefined)
    })

    it('correctly parses absolute connection strings', () => {
      const connString = 'postgres://:5432/myapp/my_database_name?application_name=myapp&sslmode=require'
      const parsed = util.parsePostgresConnectionString(connString)

      expect(parsed.database).to.equal('myapp/my_database_name')
      expect(parsed.host).to.equal('')
      expect(parsed.port).to.equal('5432')
      expect(parsed.protocol).to.equal('postgres:')
      expect(parsed.query).to.equal('application_name=myapp&sslmode=require')
    })

    it('correctly parses conection strings with auth', () => {
      const connString = 'postgres://user:pass@198.0.0.1:5432/my_database_name'
      const parsed = util.parsePostgresConnectionString(connString)

      expect(parsed.database).to.equal('my_database_name')
      expect(parsed.host).to.equal('198.0.0.1')
      expect(parsed.port).to.equal('5432')
      expect(parsed.protocol).to.equal('postgres:')
      expect(parsed.user).to.equal('user')
      expect(parsed.password).to.equal('pass')
    })
  })

  describe('essentialPlan', () => {
    it('correctly identifies essential plans', () => {
      const addon = plan => ({plan: {name: plan}})
      const parsed = addon => util.essentialPlan(addon)

      expect(parsed(addon('heroku-postgresql:mini'))).to.equal(true)
      expect(parsed(addon('heroku-postgresql:basic'))).to.equal(true)
      expect(parsed(addon('heroku-postgresql:essential-0'))).to.equal(true)
      expect(parsed(addon('heroku-postgresql:standard-0'))).to.equal(false)
      expect(parsed(addon('heroku-postgresql:private-0'))).to.equal(false)
      expect(parsed(addon('heroku-postgresql:shield-0'))).to.equal(false)
    })
  })
})
