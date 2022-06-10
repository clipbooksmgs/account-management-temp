const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");

const { beforeEach, afterEach } = require('mocha');
const Client = require("../model/Client");


chai.use(chaiAsPromised);

const expect = chai.expect;
chai.should();


const ClientService = require('../services/client-service');

describe('Client Service Tests',()=>{

    let client;
    let clientService;

    beforeEach(()=>{
        console.log('before each');
        client = getTestClient();
        clientService = new ClientService();
    });

    afterEach(async ()=> {
        console.log('after each');
        await clientService.delete(client.email);
    })


    describe('Add Client Tests',()=> {
        it('add client',async ()=> {     
            const id = await clientService.save(client);
            expect(id).to.not.null;
        });

        it('Add Duplicate Client Test - Same email',async ()=> {     
            const id = await clientService.save(client);
            const duplicateClient = getTestClient();
            return expect(clientService.save(duplicateClient))
            .to.be.rejectedWith(Error,`An account already exits with ${client.email}`);
        });
    })



    describe('Update Client Tests',()=> {
        it('update client - update name',async ()=> {     
            let clientCollectionKey = await clientService.save(client);
            console.log(clientCollectionKey);
            const clientForNewDetails = getTestClient();
            clientForNewDetails.name='elisha';
            clientCollectionKey = await clientService.update(clientForNewDetails,clientCollectionKey);
            expect(clientCollectionKey).to.not.null;
            const data = await clientService.getClientCollection(clientCollectionKey);
            expect(data.name).to.be.equal('elisha');
        });

        it('update client - update email and name',async ()=> {     
            const clientCollectionKey = await clientService.save(client);
            console.log(clientCollectionKey);
            const clientForNewDetails = getTestClient();
            clientForNewDetails.name='elisha';
            clientForNewDetails.email='elisha@gmail.com'
            const newClientCollectionKey = await clientService.update(clientForNewDetails,clientCollectionKey);
            expect(newClientCollectionKey).to.not.null;
            client = await clientService.getClientCollection(newClientCollectionKey);
            expect(client.name).to.be.equal('elisha');
            expect(client.email).to.be.equal('elisha@gmail.com');
            expect(client.password).to.be.equal('password');

        });
    })

})


const getTestClient = () => {
    const client = new Client();
    client.canditateName = 'Jhon';
    client.name='Peter';
    client.email='peter@gmail.com';
    client.password='password';
    client.peopleOfInterest=['Joe Biden','Barak Obama'];
    client.termsOfInterest=['schooling','sports'];

    return client;
}