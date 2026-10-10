//no se puede ver el type de la collection movements-of-cancellations porque en los documentos viejos no tiene el type
db.getCollection('movements-of-cancellations')
  .find({
    operationType: { $ne: 'D' },
  })
  .forEach(function (cancellation) {
    const originId = cancellation.transactionOrigin;
    const destinationId = cancellation.transactionDestination;

    const articlesOnDestination = db.getCollection('movements-of-articles').countDocuments({
      transaction: destinationId,
      operationType: { $ne: 'D' },
    });

    const articlesOnOrigin = db.getCollection('movements-of-articles').countDocuments({
      transaction: originId,
      operationType: { $ne: 'D' },
    });

    if (articlesOnDestination > 0 && articlesOnOrigin > 0) {
      // Destino ya tiene copias -> borrar origen (soft delete)
      db.getCollection('movements-of-articles').updateMany(
        { transaction: originId, operationType: { $ne: 'D' } },
        { $set: { operationType: 'D', updateDate: new Date() } }
      );
      print('Duplicados limpiados en origen ' + originId);
    } else if (articlesOnOrigin > 0) {
      // Destino vacío -> mover al destino
      db.getCollection('movements-of-articles').updateMany(
        { transaction: originId, operationType: { $ne: 'D' } },
        {
          $set: {
            transaction: destinationId,
            updateDate: new Date(),
          },
        }
      );
      print('Movidos de origen ' + originId + ' a destino ' + destinationId);
    }
  });
