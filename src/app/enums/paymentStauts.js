const PaymentStatus = Object.freeze({
    PENDING: 101,
    PAID: 102,
    PARTIAL: 103,
    REFUNDED: 104,
    CANCELLED: 105,
});

const paymentStatuses = Object.keys(PaymentStatus);

function fromById(id) {
    return Object.keys(PaymentStatus).find(
        key => PaymentStatus[key] === Number(id)
    ) ?? "PAID";
}

export { PaymentStatus, paymentStatuses, fromById };