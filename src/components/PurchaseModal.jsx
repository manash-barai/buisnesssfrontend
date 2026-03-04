import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { useDispatch, useSelector } from "react-redux";
import {
  createSupplier,
  getAllSuppliers,
} from "../features/supplier/supplierSlice";
import { getAllProducts } from "../features/product/productSlice";

// Conversion constants
const KG_PER_MON = 40; // 1 mon = 40 kg
const KG_PER_BAG = 50; // 1 bag = 50 kg
const TRAY_PER_PATI = 7; // 1 pati = 7 tray

// Helper function to format numbers
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num) || num === "") {
    return "";
  }
  const parsedNum = parseFloat(num);
  if (parsedNum === 0) {
    return "";
  }
  return parsedNum.toFixed(2).replace(/\.00$/, "");
};

// New helper function to handle decimal input
const handleDecimalInput = (value) => {
  // Allow empty value
  if (value === "") return value;

  // Allow numbers with optional decimal point
  if (/^\d*\.?\d*$/.test(value)) {
    // If the value ends with a decimal point, keep it as is
    if (value.endsWith(".")) return value;

    // Otherwise, parse as float to remove unnecessary decimal points
    const numValue = parseFloat(value);
    return isNaN(numValue) ? "" : numValue.toString();
  }

  // Return previous value if invalid
  return value;
};

const PurchaseModal = ({
  showModal,
  handleCloseModal,
  handleAddPurchase,
  newPurchase,
  handleInputChange,
  isFormValid,
  isClosing,
  purchaseUpdateId,
  handleUnitCategoryChange,
}) => {
  const dispatch = useDispatch();
  const { data: suppliers = [] } = useSelector((state) => state.supplier);
  const { data: products = [] } = useSelector((state) => state.product);

  const [supplierSearch, setSupplierSearch] = useState("");
  const [newSupplier, setNewSupplier] = useState();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [unitCategory, setUnitCategory] = useState("");
  const [convertedValues, setConvertedValues] = useState({
    kg: "",
    mon: "",
    tray: "",
    pati: "",
    bag: "",
  });

  // State for handling decimal inputs
  const [priceInputs, setPriceInputs] = useState({
    pricePerMon: "",
    pricePerPati: "",
    pricePerBag: "",
  });

  useEffect(() => {
    if (showModal) {
      dispatch(getAllSuppliers());
      dispatch(getAllProducts());
      if (!newPurchase.purchaseDate) {
        handleInputChange({
          target: {
            name: "purchaseDate",
            value: new Date().toISOString().split("T")[0],
          },
        });
      }
    }
  }, [showModal, dispatch]);

  useEffect(() => {
    if (newPurchase.supplier) {
      const supplier = suppliers.find((s) => s._id === newPurchase.supplier);
      setSelectedSupplier(supplier);
    } else {
      setSelectedSupplier(null);
    }

    if (newPurchase.products) {
      const product = products.find((p) => p._id === newPurchase.products._id);
      setSelectedProduct(product);
      if (product) {
        setUnitCategory(product.unitCategory || "");
        handleUnitCategoryChange(product.unitCategory || "");
      }
    } else {
      setSelectedProduct(null);
      setUnitCategory("");
      handleUnitCategoryChange("");
    }
  }, [newPurchase.supplier, newPurchase.products, suppliers, products]);

  // Handle unit conversions
  const handleUnitConversion = (name, value) => {
    const numValue = parseFloat(value) || 0;
    let newConvertedValues = { ...convertedValues };

    switch (name) {
      case "kg":
        newConvertedValues = {
          kg: value,
          mon: formatNumber(numValue / KG_PER_MON),
          tray: "",
          pati: "",
          bag: formatNumber(numValue / KG_PER_BAG),
        };
        break;
      case "mon":
        newConvertedValues = {
          kg: formatNumber(numValue * KG_PER_MON),
          mon: value,
          tray: "",
          pati: "",
          bag: formatNumber((numValue * KG_PER_MON) / KG_PER_BAG),
        };
        break;
      case "tray":
        newConvertedValues = {
          kg: "",
          mon: "",
          tray: value,
          pati: formatNumber(numValue / TRAY_PER_PATI),
          bag: "",
        };
        break;
      case "pati":
        newConvertedValues = {
          kg: "",
          mon: "",
          tray: formatNumber(numValue * TRAY_PER_PATI),
          pati: value,
          bag: "",
        };
        break;
      case "bag":
      default:
        newConvertedValues = {
          kg: formatNumber(numValue * KG_PER_BAG),
          mon: formatNumber((numValue * KG_PER_BAG) / KG_PER_MON),
          tray: "",
          pati: "",
          bag: value,
        };
    }

    setConvertedValues(newConvertedValues);

    let quantityInMainUnit;
    switch (unitCategory) {
      case "KG":
        quantityInMainUnit = newConvertedValues.kg;
        handleInputChange({
          target: { name: "quantity", value: quantityInMainUnit || "" },
        });
        break;
      case "tray":
        quantityInMainUnit = newConvertedValues.tray;
        handleInputChange({
          target: { name: "quantity", value: quantityInMainUnit || "" },
        });
        break;
      case "bag":
        quantityInMainUnit = newConvertedValues.bag;
        handleInputChange({
          target: { name: "quantity", value: quantityInMainUnit || "" },
        });
        break;
      default:
        // Fallback for products with no unit category or other categories
        quantityInMainUnit = value;
    }
  };

  useEffect(() => {
    const price = parseFloat(newPurchase.Price_PerUnit) || 0;
    let totalAmount = 0;

    if (selectedProduct) {
      let quantityInMainUnit = 0;
      switch (unitCategory) {
        case "KG":
          quantityInMainUnit = parseFloat(convertedValues.kg) || 0;
          break;
        case "tray":
          quantityInMainUnit = parseFloat(convertedValues.tray) || 0;
          break;
        case "bag":
          quantityInMainUnit = parseFloat(convertedValues.bag) || 0;
          break;
        default:
          quantityInMainUnit = parseFloat(newPurchase.quantity) || 0;
      }
      totalAmount = quantityInMainUnit * price;
    }

    const dueAmount = totalAmount - newPurchase.paidAmount;

    if (newPurchase.totalAmount !== formatNumber(totalAmount)) {
      handleInputChange({
        target: { name: "totalAmount", value: formatNumber(totalAmount) },
      });
    }
    if (newPurchase.dueAmount !== formatNumber(dueAmount)) {
      handleInputChange({
        target: { name: "dueAmount", value: formatNumber(dueAmount) },
      });
    }
  }, [
    newPurchase,
    convertedValues,
    unitCategory,
    selectedProduct,
    handleInputChange,
  ]);

  // This useEffect updates the per-mon/pati/bag price inputs when Price_PerUnit changes.
  useEffect(() => {
    const pricePerUnit = parseFloat(newPurchase.Price_PerUnit);

    if (!isNaN(pricePerUnit)) {
      let newPriceInputs = { ...priceInputs };
      switch (unitCategory) {
        case "KG":
          newPriceInputs.pricePerMon = formatNumber(pricePerUnit * KG_PER_MON);
          break;
        case "tray":
          newPriceInputs.pricePerPati = formatNumber(
            pricePerUnit * TRAY_PER_PATI
          );
          break;
        case "bag":
          newPriceInputs.pricePerBag = formatNumber(pricePerUnit * KG_PER_BAG);
          break;
        default:
          break;
      }
      setPriceInputs(newPriceInputs);
    } else {
      // If Price_PerUnit is cleared, clear the specific price inputs
      if (unitCategory === "KG") {
        setPriceInputs((prev) => ({ ...prev, pricePerMon: "" }));
      } else if (unitCategory === "tray") {
        setPriceInputs((prev) => ({ ...prev, pricePerPati: "" }));
      } else if (unitCategory === "bag") {
        setPriceInputs((prev) => ({ ...prev, pricePerBag: "" }));
      }
    }
  }, [newPurchase.Price_PerUnit, unitCategory]);

  // Handle price input changes with proper decimal handling
  const handlePriceInputChange = (e, unitType) => {
    const { value } = e.target;
    const processedValue = handleDecimalInput(value);

    // Update the input state for the field being changed
    setPriceInputs((prev) => ({
      ...prev,
      [unitType]: processedValue,
    }));

    // Calculate the actual price per unit
    if (processedValue && processedValue !== ".") {
      let pricePerUnit;

      switch (unitType) {
        case "pricePerMon":
          pricePerUnit = parseFloat(processedValue) / KG_PER_MON;
          break;
        case "pricePerPati":
          pricePerUnit = parseFloat(processedValue) / TRAY_PER_PATI;
          break;
        case "pricePerBag":
          pricePerUnit = parseFloat(processedValue) / KG_PER_BAG;
          break;
        default:
          pricePerUnit = parseFloat(processedValue);
      }

      handleInputChange({
        target: { name: "Price_PerUnit", value: pricePerUnit.toString() },
      });
    } else if (processedValue === "") {
      handleInputChange({
        target: { name: "Price_PerUnit", value: "" },
      });
    }
  };

  const handlePricePerUnitChange = (e) => {
    const { value } = e.target;
    const processedValue = handleDecimalInput(value);
    handleInputChange({
      target: { name: "Price_PerUnit", value: processedValue },
    });
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setUnitCategory(product.unitCategory || "");
    handleUnitCategoryChange(product.unitCategory || "");
    setConvertedValues({
      kg: "",
      mon: "",
      tray: "",
      pati: "",
      bag: "",
    });

    // Reset price inputs
    setPriceInputs({
      pricePerMon: "",
      pricePerPati: "",
      pricePerBag: "",
    });

    handleInputChange({
      target: {
        name: "products",
        value: { _id: product._id, name: product.name },
      },
    });

    const fieldsToReset = [
      "quantity",
      "Price_PerUnit",
      "totalAmount",
      "paidAmount",
      "dueAmount",
      "totalBag",
    ];

    fieldsToReset.forEach((field) => {
      handleInputChange({ target: { name: field, value: "" } });
    });

    handleInputChange({
      target: {
        name: "purchaseDate",
        value: new Date().toISOString().split("T")[0],
      },
    });
  };

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    handleInputChange({
      target: { name: "supplier", value: supplier._id },
    });
  };

  const getStockDisplay = (unitCategory) => {
    if (!selectedProduct) return "";
    switch (unitCategory) {
      case "KG":
        return `${selectedProduct.currentStock || 0} kg (${formatNumber(
          (selectedProduct.currentStock || 0) / KG_PER_MON
        )} mon)`;
      case "tray":
        return `${selectedProduct.currentStock || 0} tray (${formatNumber(
          (selectedProduct.currentStock || 0) / TRAY_PER_PATI
        )} pati)`;
      case "bag":
        return `${selectedProduct.currentStock || 0} bag (${formatNumber(
          (selectedProduct.currentStock || 0) * KG_PER_BAG
        )} kg)`;
      default:
        return `${selectedProduct.currentStock || 0}`;
    }
  };

  const getNewStockDisplay = () => {
    if (!selectedProduct) return "";
    const currentStock = selectedProduct.currentStock || 0;
    const addedQuantity = parseFloat(newPurchase.quantity) || 0;
    const newStock = currentStock + addedQuantity;

    switch (unitCategory) {
      case "Kg":
        return `${formatNumber(newStock)} kg (${formatNumber(
          newStock / KG_PER_MON
        )} mon)`;
      case "Tray":
        return `${formatNumber(newStock)} tray (${formatNumber(
          newStock / TRAY_PER_PATI
        )} pati)`;
      case "Bag":
        return `${formatNumber(newStock)} bag (${formatNumber(
          newStock * KG_PER_BAG
        )} kg)`;
      default:
        return `${formatNumber(newStock)} units`;
    }
  };

  const getUnitLabel = () => {
    switch (unitCategory) {
      case "Kg":
        return "Price Per Kg";
      case "Tray":
        return "Price Per Tray";
      case "bag":
        return "Price Per Bag";
      default:
        return "Price Per Unit";
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  if (!showModal) {
    return null;
  }
  const addSupplier = async () => {
    try {
      const supplier = await dispatch(
        createSupplier({ name: newSupplier })
      ).unwrap(); // 🔥 this makes errors throw

      handleSupplierSelect(supplier);
      setNewSupplier("");
     
    } catch (error) {
      // error is now your backend message
      alert(error)
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Rnd
        default={{
          x: window.innerWidth / 2 - 300,
          y: window.innerHeight / 2 - 250,
          width: 600,
          height: 600,
        }}
        minWidth={400}
        minHeight={500}
        bounds="window"
        dragHandleClassName="drag-handle"
        enableResizing={true}
        className="bg-transparent flex items-center justify-center"
      >
        <div
          className={`bg-white rounded-lg shadow-lg flex flex-col ${
            isClosing ? "animate-slideFadeOut" : "animate-slideFadeIn"
          } w-full h-full`}
        >
          <div className="drag-handle cursor-move bg-primary-600 text-white flex justify-between items-center px-4 py-2 rounded-t-lg">
            <h2 className="text-lg font-semibold">
              {purchaseUpdateId ? "Update Purchase" : "Add New Purchase"}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCloseModal}
                className="text-sm border border-white px-3 py-1 rounded hover:bg-white hover:text-primary-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPurchase}
                disabled={!isFormValid || !selectedSupplier || !selectedProduct}
                className={`text-sm px-3 py-1 rounded transition ${
                  isFormValid && selectedSupplier && selectedProduct
                    ? "bg-white text-primary-600 hover:bg-app-primary-100"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                {purchaseUpdateId ? "Update" : "Save"}
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-auto">
            <div>
              <input
                type="text"
                placeholder="Search Supplier"
                value={supplierSearch}
                onChange={(e) => {
                  setSupplierSearch(e.target.value);
                }}
                className="w-full border px-3 py-2 rounded mb-2"
              />
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {filteredSuppliers.map((supplier) => (
                  <button
                    key={supplier._id}
                    onClick={() => handleSupplierSelect(supplier)}
                    className={`border px-3 py-1 rounded ${
                      selectedSupplier?._id === supplier._id
                        ? "bg-app-primary-100 border-app-primary-800"
                        : "bg-gray-100"
                    }`}
                  >
                    {supplier.name}
                  </button>
                ))}
                
                
                  <div className="flex items-center max-w-sm">
                    <input
                      type="text"
                      value={newSupplier}
                      onChange={(e) => setNewSupplier(e.target.value)}
                      placeholder="Enter supplier name"
                      className="flex-1 px-4 py-1 border border-gray-300  rounded-l-lg
                          focus:outline-none   transition duration-200 border-r-0"
                    />
                    <button
                      onClick={addSupplier}
                      className="px-5 py-1 bg-blue-950 text-white font-medium 
                         hover:bg-blue-700 
                        active:scale-95 transition duration-200 shadow-md rounded-r-lg "
                    >
                      OK
                    </button>
                  </div>
                
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Search Product"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                }}
                className="w-full border px-3 py-2 rounded mb-2"
                disabled={!selectedSupplier}
              />
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleProductSelect(product)}
                    className={`border px-3 py-1 rounded ${
                      selectedProduct?._id === product._id
                        ? "bg-app-primary-100 border-app-primary-800"
                        : "bg-gray-100"
                    }`}
                    disabled={!selectedSupplier}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedProduct && (
              <div className="p-2 bg-gray-100 rounded">
                <p>
                  <strong>Current Stock:</strong>{" "}
                  {getStockDisplay(unitCategory)}{" "}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity inputs based on unit category */}
              {unitCategory === "KG" && (
                <>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={convertedValues.kg}
                      onChange={(e) =>
                        handleUnitConversion("kg", e.target.value)
                      }
                      placeholder="Quantity in kg"
                      className="w-full border px-3 py-2 rounded"
                      disabled={!selectedProduct}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity (mon)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={convertedValues.mon}
                      onChange={(e) =>
                        handleUnitConversion("mon", e.target.value)
                      }
                      placeholder="Quantity in mon"
                      className="w-full border px-3 py-2 rounded"
                      disabled={!selectedProduct}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Bags
                    </label>
                    <input
                      type="text"
                      name="totalBag"
                      value={formatNumber(newPurchase.totalBag)}
                      onChange={handleInputChange}
                      placeholder="Total Bags"
                      className="w-full border px-3 py-2 rounded bg-gray-100"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Price (Mon)
                    </label>
                    <input
                      type="text"
                      value={priceInputs.pricePerMon}
                      onChange={(e) => handlePriceInputChange(e, "pricePerMon")}
                      placeholder="Price per mon"
                      className="w-full border px-3 py-2 rounded"
                      disabled={!selectedProduct}
                    />
                  </div>
                </>
              )}

              {unitCategory === "tray" && (
                <>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity (tray)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={convertedValues.tray}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value))
                          handleUnitConversion("tray", e.target.value);
                      }}
                      placeholder="Quantity in tray"
                      className="w-full border px-3 py-2 rounded"
                      disabled={!selectedProduct}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity (pati)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={convertedValues.pati}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value))
                          handleUnitConversion("pati", e.target.value);
                      }}
                      placeholder="Quantity in pati"
                      className="w-full border px-3 py-2 rounded"
                      disabled={!selectedProduct}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Price (Pati)
                    </label>
                    <input
                      type="text"
                      value={priceInputs.pricePerPati}
                      inputMode="decimal"
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          handlePriceInputChange(e, "pricePerPati");
                        }
                      }}
                      placeholder="Price per pati"
                      className="w-full border px-3 py-2 rounded"
                      disabled={!selectedProduct}
                    />
                  </div>
                </>
              )}

              {unitCategory === "bag" && (
                <>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity (bag)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={convertedValues.bag}
                      // onChange={(e) =>
                      //   handleUnitConversion("bag", e.target.value)
                      // }
                      onChange={(e) => {
                        const val = e.target.value;

                        // allow only numbers + one decimal
                        if (/^\d*\.?\d*$/.test(val)) {
                          handleUnitConversion("bag", val);
                        }
                      }}
                      placeholder="Quantity in bag"
                      className="w-full border px-3 py-2 rounded"
                      disabled={!selectedProduct}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity (kg)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={convertedValues.kg}
                      onChange={(e) => {
                        const val = e.target.value;

                        // allow only numbers + one decimal
                        if (/^\d*\.?\d*$/.test(val)) {
                          handleUnitConversion("kg", val);
                        }
                      }}
                      placeholder="Quantity in kg"
                      className="w-full border px-3 py-2 rounded"
                      disabled={!selectedProduct}
                    />
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Bags
                    </label>
                    <input
                      type="text"
                      name="totalBag"
                      value={formatNumber(newPurchase.totalBag)}
                      onChange={handleInputChange}
                      placeholder="Total Bags"
                      className="w-full border px-3 py-2 rounded bg-gray-100"
                      disabled
                    />
                  </div> */}

                  {/* <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Price (Bag)
                    </label>
                    <input
                      type="text"
                      value={priceInputs.pricePerBag}
                      onChange={(e) => handlePriceInputChange(e, "pricePerBag")}
                      placeholder="Price per bag"
                      className="w-full border px-3 py-2 rounded"
                      disabled={!selectedProduct}
                    />
                  </div> */}
                </>
              )}

              {!["KG", "tray", "bag"].includes(unitCategory) && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="quantity"
                    value={formatNumber(newPurchase.quantity)}
                    onChange={(e) =>
                      handleInputChange({
                        target: { name: "quantity", value: e.target.value },
                      })
                    }
                    placeholder="Quantity"
                    className="w-full border px-3 py-2 rounded"
                    disabled
                  />
                </div>
              )}

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  {getUnitLabel()}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="Price_PerUnit"
                  value={newPurchase.Price_PerUnit}
                  onChange={handlePricePerUnitChange}
                  placeholder={getUnitLabel()}
                  className="w-full border px-3 py-2 rounded"
                  disabled={!selectedProduct}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Amount
                </label>
                <input
                  type="text"
                  name="totalAmount"
                  value={formatNumber(newPurchase.totalAmount)}
                  placeholder="Total Amount"
                  className="w-full border px-3 py-2 rounded bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Paid Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="paidAmount"
                  value={newPurchase.paidAmount}
                  onChange={handleInputChange}
                  placeholder="Paid Amount"
                  className="w-full border px-3 py-2 rounded"
                  disabled={!selectedProduct}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Amount
                </label>
                <input
                  type="text"
                  name="dueAmount"
                  value={formatNumber(newPurchase.dueAmount)}
                  placeholder="Due Amount"
                  className="w-full border px-3 py-2 rounded bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={
                    newPurchase.purchaseDate ||
                    new Date().toISOString().split("T")[0]
                  }
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  disabled={!selectedProduct}
                />
              </div>
            </div>
          </div>
        </div>
      </Rnd>
    </div>
  );
};

export default PurchaseModal;
