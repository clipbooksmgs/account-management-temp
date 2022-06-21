const StripeException = require('../exceptions/stripe-exception');

const {stripe}  = require('../config/stripe');
const logger = require('../config/log-configuration');



const createCustomer = async (client) => {
    logger.info('createCustomer::'+JSON.stringify(client));
    try{
        const customer = await stripe.customers.create({
            name: `${client.firstname} ${client.lastname}`,
            email: client.email,
            description: 'Clipbook customer registration'
        });
        logger.info('Stripe Customer Object created'+JSON.stringify(customer));
        return {
            customerId: customer.id
        }
    }catch(err){
        logger.error(err);
        throw new StripeException(err.raw.message);
    }      
}

const createSubscription = async (subscriptionDetails) => {
    logger.info("createSubscrition:: "+ JSON.stringify(subscriptionDetails));
    try{
        const subscription = await stripe.subscriptions.create({
            customer: subscriptionDetails.customerId,
            items: [{
                price: subscriptionDetails.priceId,
            }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        })

        return {
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        }
    }catch(err){
        logger.error(err);
        throw StripeException(err.raw.message);
    }
}

module.exports = {
    createCustomer,
    createSubscription
}