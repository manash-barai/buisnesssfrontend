import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const formatNumber = (num) => {
  if (!num) return "0.00";
  return parseFloat(num).toFixed(2);
};

const Receipt = React.forwardRef(({ billData }, ref) => {
  const minRows = 5;
  const emptyRows = Math.max(0, minRows - billData.items.length);

  return (
    <div
      ref={ref}
      className="p-2 bg-white text-gray-800 text-xs font-mono"
      style={{ width: "58mm", minHeight: "100%" }}
    >
      {/* Header */}
      <div className="text-center mb-2">
        <img
          src="https://img.freepik.com/free-vector/illustration-ganesha-hindu-god_23-2150279330.jpg"
          alt="Ganesh"
          className="h-10 w-10 mx-auto"
        />
        <h2 className="font-bold text-base">JP TRADERS</h2>
        <p className="text-[10px]">Shop No 3 Dhulagor Truck Terminal</p>
        <p className="text-[10px]">Sankrail, Howrah</p>
        <p className="text-[10px]">Ph: 9830705423 / 7439466740</p>
      </div>

      {/* Bill Info */}
      <div className="flex justify-between text-[11px] mb-1">
        <span>Bill No: {billData.billNo}</span>
        <span>{billData.date}</span>
      </div>
      <div className="text-[11px] mb-2">Customer: {billData.customer}</div>

      {/* Table */}
      <table className="w-full text-[10px] mb-2">
  <thead>
    <tr className="border-t  border-black">
      <th className="text-left w-[20%]">Item</th>
      <th className="text-center w-[15%]">Qty</th>
      <th className="text-center w-[15%]">Wt</th>
      <th className="text-right w-[20%]">Rate</th>
      <th className="text-right w-[30%]">Amount</th>
    </tr>
  </thead>
  <tbody>
    {billData.items.map((item, i) => (
      <tr key={i} className="border-b border-dotted border-gray-400">
        <td style={{textTransform: "uppercase"}} className="truncate">{item.name}</td>
        <td className="text-center">{item.qty}</td>
        <td className="text-center">{formatNumber(item.weight)}</td>
        <td className="text-right">{formatNumber(item.rate)}</td>
        <td className="text-right">{formatNumber(item.amount)}</td>
      </tr>
    ))}
    {Array.from({ length: emptyRows }).map((_, i) => (
      <tr key={`empty-${i}`} className="h-4">
        <td colSpan="5">&nbsp;</td>
      </tr>
    ))}
  </tbody>
</table>


      {/* Totals */}
      <div className="flex justify-between text-[11px] border-t border-black pt-1">
        <span>Old Due</span>
        <span>{formatNumber(billData.customerTotalDue)}</span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span>Recent Bill</span>
        <span>{formatNumber(billData.total)}</span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span>Payment</span>
        <span>{formatNumber(billData.payment)}</span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span>R/D</span>
        <span>{formatNumber(billData.rd)}</span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span>Total Payment</span>
        <span>{formatNumber(billData.totalPayment)}</span>
      </div>
      
      <div className="flex justify-between text-[11px]">
        <span>Total Due</span>
        <span className="font-bold">{formatNumber(billData.totalDue)}</span>
      </div>

      {/* Notes */}
      {billData.notes && (
        <div className="mt-2 text-[10px] border-t border-black pt-1">
          <p className="font-bold">Notes:</p>
          <div
            dangerouslySetInnerHTML={{
              __html: billData.notes.replace(/\n/g, '<br />'),
            }}
          />
        </div>
      )}

      {/* Terms */}
      <div className="mt-2 text-[9px] text-gray-600 border-t border-black pt-1">
        <p>No discount will be given on assessed value.</p>
      </div>

      {/* Footer */}
      <div className="text-center mt-2 text-[9px]">
        <p>Last Receipt Rs. {billData.lastReceipt} A/C</p>
        <p className="mt-1">Thank you for your business!</p>
      </div>
    </div>
  );
});

export default function SalePrintPage({ billData,notes }) {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDownloadPdf = () => {
    const input = componentRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        unit: "mm",
        format: [58, (canvas.height * 58) / canvas.width],
      });
      pdf.addImage(imgData, "PNG", 0, 0, 58, (canvas.height * 58) / canvas.width);
      pdf.save(`receipt-${billData.billNo}.pdf`);
    });
  };

  return (
    <div>
      <Receipt ref={componentRef} billData={billData} />
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <button onClick={handlePrint} style={{ marginRight: "10px" }}>
          Print Receipt
        </button>
        <button onClick={handleDownloadPdf}>Download as PDF</button>
      </div>
    </div>
  );
}
