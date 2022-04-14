    window.onload = async () => {
        var parent = document.querySelector('.checkout-steps');

        if (parent.addEventListener) {
            parent.addEventListener('click', handler, false);
        }else if (parent.attachEvent) {
            parent.attachEvent('onclick', handler);
        }

        async function handler(e) {
            if (e.target.id == 'checkout-payment-continue') {
                if(document.querySelector(".form-checklist-item--selected .paymentProviderHeader-name").innerText === "BKT") {
                    e.preventDefault(); 
                    const module = await checkoutKitLoader.load('checkout-sdk');
                    const service = module.createCheckoutService();
                    const checkoutId = await fetch('/api/storefront/cart', {
                      credentials: 'include'
                    }).then(function(response) {
                      return response.json();
                    }).then(function(myJson) {
                      return myJson[0].id;
                    });
                    console.log("checkout:: ",checkoutId);
                    const checkoutState = await service.loadCheckout(checkoutId);
                    console.log("Checkout:: ", checkoutState.data.getCheckout());
                    const paymentState = await service.loadPaymentMethods();
                    console.log("Payment Methods:: ", paymentState.data.getPaymentMethods());
                    await service.initializePayment({ methodId: 'cheque' });
                    const paymentDetails = {
                        methodId: "cheque"
                    };
                    const payment = await service.submitOrder({ payment: paymentDetails });
                    const order = payment.data.getOrder();
                   console.log("order::", order);
                 
                    const orderProducts=[];
                    
                    order.lineItems.digitalItems.map(it=>{
                    	orderProducts.push({
                        "productId":it.productId,
                        "name":it.name,
                        "sku":it.sku,
                        "quantity" :it.quantity,
                        "discountAmount":it.discountAmount,
                        "salePrice":it.salePrice
                        });
                    });
                    console.log("orderProducts::", orderProducts);
                    
                    const orderInfo = {
                    	"FROM":"BIGCOMMERCE",
                        "TO":"BKT",
                        "STORE":"PROFISC",
                        "OBJECT_INFO":{
                        	"order_id": order.orderId,
                            "status_id":11,
                            "orderProducts":orderProducts,
                            "order_amount":order.orderAmount,
                            "redirect_url":"https://profisc.mybigcommerce.com/checkout/order-confirmation",
                            "order_currency": order.currency.code,
                            "email":order.billingAddress.email,
                            "name":order.billingAddress.firstName,
                            "last_name":order.billingAddress.lastName,
                            "phone":order.billingAddress.phone,
                            "address":order.billingAddress.address1,
                            "tax_total":order.taxTotal
                        }
                        
                    }
				
                    var stringOrderInfo = JSON.stringify(orderInfo) ;
                    
                    console.log({orderInfo})
					var enc = btoa(stringOrderInfo);
					console.log({enc})
                    
					return;
					window.location.href = "https://api.tetra.al/pay?orderInfo="+enc;


					 
			
						  
				}
            }
        }
        
    }

