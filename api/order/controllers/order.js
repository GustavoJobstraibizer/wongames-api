'use strict';

const stripe = require('stripe')(process.env.STRIPE_KEY)
const { sanitizeEntity } = require('strapi-utils');
const orderTemplate = require('../../../config/email-templates/order')

module.exports = {
  createPaymentIntent: async (ctx) => {
    const { cart } = ctx.request.body;

    if (!cart) return []

    const cartGamesIds = await strapi.config.functions.cart.cartGamesIds(cart)

    const games = await strapi.config.functions.cart.cartItems(cartGamesIds);

    if (!games.length) {
      ctx.response.status = 404

      return {
        error: 'No valid games found'
      }
    }

    const total = await strapi.config.functions.cart.totalOrderPrice(games);

    if (total === 0) {
      return {
        freeGames: true
      }
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: 'usd',
        metadata: { cart: JSON.stringify(cartGamesIds) },
      });

      return paymentIntent;
    } catch (error) {
      return {
        error: error.raw.message,
      }
    }
  },
  create: async (ctx) => {
    // pegar as infos do client
    const { cart, paymentIntentId, paymentMethod } = ctx.request.body;

    // pegar o token
    const token = await strapi.plugins['users-permissions'].services.jwt.getToken(ctx)

    // pega o id do usuario
    const userId = token.id

    // pegar as infos do usuario
    const userInfo = await strapi.query('user', 'users-permissions').findOne({ id: userId })

    const cartGamesIds = await strapi.config.functions.cart.cartGamesIds(cart)

    // pegar todos os jogos
    const games = await strapi.config.functions.cart.cartItems(cartGamesIds);

    // pegar o total do pedido
    const totalInCents = await strapi.config.functions.cart.totalOrderPrice(games);

    // pegar as infos do payment
    let paymentInfo = {};
    if (totalInCents > 0) {
      try {
        paymentInfo = await stripe.paymentMethods.retrieve(paymentMethod)
      } catch (err) {
        ctx.response.status = 402
        return { error: err.message }
      }
    }

    const entry = {
      total_in_cents: totalInCents,
      payment_intent_id: paymentIntentId,
      card_brand: paymentInfo && paymentInfo.card && paymentInfo.card.brand,
      card_last4: paymentInfo && paymentInfo.card && paymentInfo.card.last4,
      games,
      user: userInfo,
    }

    const entity = await strapi.services.order.create(entry);

    // enviar email da compra para o usuario
    await strapi.plugins['email-designer'].services.email.sendTemplatedEmail({
      to: userInfo.email,
      from: 'no-reply@wongames.com'
    },
    {
      templateId: 1
    },
    {
      user: userInfo,
      payment: {
        total: `$ ${totalInCents / 100}`,
        card_brand: entry.card_brand,
        card_last4: entry.card_last4,
      },
      games
    })


    return sanitizeEntity(entity, { model: strapi.models.order });
  }
};
