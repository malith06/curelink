
  return (
    <div className="animate-in fade-in duration-500 bg-slate-50 min-h-screen pb-20">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
          <button onClick={() => navigate('/pharmacy/inbox')} className="text-blue-200 hover:text-white flex items-center text-sm font-medium w-fit group transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Inbox
          </button>
          
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg shrink-0">
                  <List className="w-7 h-7 text-white" />
               </div>
               <div>
                 <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 flex-wrap">
                   {request.customerId?.fullName || 'Customer'}'s Request
                   <span className="text-blue-200 font-medium text-lg ml-2">#{request._id.substring(request._id.length - 6).toUpperCase()}</span>
                 </h1>
                 <p className="mt-1 text-blue-100 font-medium flex items-center">
                   <Clock className="w-4 h-4 mr-1.5" />
                   Received on {new Date(request.createdAt).toLocaleString()}
                 </p>
               </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="flex items-center gap-3">
                <Badge variant="default">{request.status.replace(/_/g, ' ')}</Badge>
                {quotation && (
                  <div>
                    {renderStatusBadge(quotation.status)}
                  </div>
                )}
              </div>
              
              {request.prescriptionIds && request.prescriptionIds.length > 0 && (
                <div className="flex gap-2 flex-wrap justify-start md:justify-end">
                  {request.prescriptionIds.map((presc, idx) => (
                    <button
                      key={presc._id}
                      onClick={() => handleViewPrescription(presc._id)}
                      disabled={openingPrescription === presc._id}
                      className="inline-flex items-center px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {openingPrescription === presc._id ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-1.5" />
                      )}
                      Prescription {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">
        <div className="space-y-8">
          <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">

        {!quotation ? (
          <CardContent className="p-12 text-center text-slate-500 font-medium">
            This request has been closed (e.g., converted to an order or cancelled) and you did not submit a quotation.
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Req Qty</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Avail Qty</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price (Rs)</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal (Rs)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {quotation?.items.map((qItem) => {
                  const reqItem = request.items.find(i => i._id === qItem.requestItemId);
                  const isEditing = isDraft;
                  
                  return (
                    <tr key={qItem._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 text-sm">
                          {qItem.medicineSnapshot?.name || reqItem?.medicineId?.name || 'Medicine'}
                          {(qItem.medicineSnapshot?.dosage || reqItem?.medicineId?.dosage) && (
                            <span className="text-slate-500 font-normal ml-1">({qItem.medicineSnapshot?.dosage || reqItem?.medicineId?.dosage})</span>
                          )}
                        </div>
                        {reqItem?.prescriptionRequired && (
                          <div className="mt-1.5">
                             <Badge variant="error" className="text-[10px]">Prescription Required</Badge>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-slate-700">
                        {qItem.requestedQuantity}
                      </td>
                      
                      {/* Available Quantity */}
                      <td className="px-6 py-5 text-center">
                        {isEditing ? (
                          <input 
                            type="number" 
                            min="0"
                            max={qItem.requestedQuantity}
                            className="w-20 px-3 py-1.5 text-center font-bold border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            value={draftItems[qItem.requestItemId]?.availableQuantity ?? ''}
                            onChange={(e) => handleItemChange(qItem.requestItemId, 'availableQuantity', parseInt(e.target.value) || 0)}
                          />
                        ) : (
                          <span className="font-bold text-slate-900">{qItem.availableQuantity}</span>
                        )}
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-5 text-right">
                        {isEditing ? (
                          <div className="flex justify-end relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rs</span>
                            <input 
                              type="number" 
                              min="0"
                              step="0.01"
                              className="w-28 pl-8 pr-3 py-1.5 text-right font-bold border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                              value={draftItems[qItem.requestItemId]?.unitPrice ?? ''}
                              onChange={(e) => handleItemChange(qItem.requestItemId, 'unitPrice', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                        ) : (
                          <span className="font-medium text-slate-700">{qItem.unitPrice?.toFixed(2) || '0.00'}</span>
                        )}
                      </td>
                      
                      {/* Subtotal */}
                      <td className="px-6 py-5 text-right font-bold text-primary-600 text-lg">
                        {isEditing ? (
                          <span>{((draftItems[qItem.requestItemId]?.availableQuantity || 0) * (draftItems[qItem.requestItemId]?.unitPrice || 0)).toFixed(2)}</span>
                        ) : (
                          <span>{qItem.subtotal?.toFixed(2) || '0.00'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
        )}
      </Card>

      {/* Quotation Metadata */}
      {quotation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <h4 className="font-bold text-slate-900 flex items-center text-lg">
                <Truck className="w-5 h-5 mr-2 text-primary-500" />
                Fulfillment Details
              </h4>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    (isDraft ? draftMeta.pickupAvailable : quotation.pickupAvailable) 
                      ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500/10' 
                      : 'border-slate-200 hover:border-primary-300'
                  }`}>
                  <div className="flex items-center h-5">
                    <input 
                      type="checkbox" 
                      disabled={!isDraft}
                      checked={isDraft ? draftMeta.pickupAvailable : quotation.pickupAvailable}
                      onChange={(e) => handleMetaChange('pickupAvailable', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                    />
                  </div>
                  <div className="ml-3">
                    <span className="block font-bold text-slate-900">Pickup</span>
                    <span className="block text-xs text-slate-500 font-medium">Customer picks up</span>
                  </div>
                </label>

                <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    (isDraft ? draftMeta.deliveryAvailable : quotation.deliveryAvailable) 
                      ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500/10' 
                      : 'border-slate-200 hover:border-primary-300'
                  }`}>
                  <div className="flex items-center h-5">
                    <input 
                      type="checkbox" 
                      disabled={!isDraft}
                      checked={isDraft ? draftMeta.deliveryAvailable : quotation.deliveryAvailable}
                      onChange={(e) => handleMetaChange('deliveryAvailable', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                    />
                  </div>
                  <div className="ml-3">
                    <span className="block font-bold text-slate-900">Delivery</span>
                    <span className="block text-xs text-slate-500 font-medium">Deliver to address</span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(isDraft ? draftMeta.deliveryAvailable : quotation.deliveryAvailable) && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-700">Delivery Fee (Rs)</label>
                    {isDraft ? (
                      <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        value={draftMeta.deliveryFee}
                        onChange={(e) => handleMetaChange('deliveryFee', parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <div className="font-bold text-slate-900 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        Rs. {quotation.deliveryFee?.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Prep Time (Minutes)</label>
                  {isDraft ? (
                    <Input 
                      type="number"
                      min="15"
                      step="5"
                      value={draftMeta.preparationMinutes}
                      onChange={(e) => handleMetaChange('preparationMinutes', parseInt(e.target.value) || 30)}
                    />
                  ) : (
                    <div className="font-bold text-slate-900 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      {quotation.preparationMinutes} mins
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <h4 className="font-bold text-slate-900 flex items-center text-lg">
                  <FileText className="w-5 h-5 mr-2 text-primary-500" />
                  Notes to Customer
                </h4>
              </CardHeader>
              <CardContent className="p-6">
                {isDraft ? (
                  <textarea 
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none shadow-sm font-medium"
                    rows="3"
                    value={draftMeta.pharmacyNotes}
                    onChange={(e) => handleMetaChange('pharmacyNotes', e.target.value)}
                    placeholder="Add special instructions, alternative brands, or general information..."
                  />
                ) : (
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-medium leading-relaxed">
                    {quotation.pharmacyNotes || 'No additional notes provided.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {isSubmitted && (
              <Card className="bg-primary-50 border-primary-100 overflow-hidden">
                <CardContent className="p-6">
                  <h4 className="font-bold text-primary-900 mb-4 text-lg">Quotation Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-primary-700/70">Subtotal:</span>
                      <span className="text-primary-900">Rs. {quotation.subtotal?.toFixed(2)}</span>
                    </div>
                    {quotation.deliveryAvailable && (
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-primary-700/70">Delivery Fee:</span>
                        <span className="text-primary-900">Rs. {quotation.deliveryFee?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-black mt-4 pt-4 border-t border-primary-200/50">
                      <span className="text-primary-900">Total:</span>
                      <span className="text-primary-700 text-2xl">Rs. {quotation.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isDraft && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start text-amber-700 bg-amber-50 p-4 rounded-xl text-sm border border-amber-100 flex-1">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">Submitting this quotation is final. You will not be able to edit the prices or quantities once submitted to the customer.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Button
              onClick={handleSaveDraft}
              disabled={saving || submitting}
              isLoading={saving}
              variant="outline"
              icon={Save}
              size="lg"
            >
              Save Draft
            </Button>
            
            <Button 
              onClick={handleSubmitQuotation}
              disabled={saving || submitting}
              isLoading={submitting}
              icon={Send}
              size="lg"
            >
              Submit Quotation
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PharmacyRequestDetailsPage;
