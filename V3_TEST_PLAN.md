# 🧪 V3 Nutrition Plan Editor - Test Plan

## ✅ **Test Scenarios**

### **1. Basic Functionality**
- [ ] **Page Load**: V3 route loads without errors
- [ ] **Data Display**: Plan data displays correctly
- [ ] **Ingredient Parsing**: Existing ingredients are parsed and displayed
- [ ] **Macro Calculation**: Total macros are calculated correctly

### **2. Ingredient Management**
- [ ] **Add Ingredient**: Modal opens and allows adding new ingredients
- [ ] **Search Ingredients**: Search functionality works in modal
- [ ] **Quantity Update**: Changing ingredient quantities updates macros
- [ ] **Remove Ingredient**: Deleting ingredients works correctly
- [ ] **Unit Handling**: Different units (g, ml, piece, slice) work correctly

### **3. Auto-Save Functionality**
- [ ] **Debounced Save**: Changes are saved after 1 second delay
- [ ] **Database Persistence**: Changes persist after page refresh
- [ ] **Error Handling**: Save errors are handled gracefully
- [ ] **Loading States**: Saving state is indicated to user

### **4. Data Integrity**
- [ ] **JSON Format**: Data is stored in clean JSON format
- [ ] **No Double Scaling**: Macros are not scaled multiple times
- [ ] **Consistent State**: UI state matches database state
- [ ] **Translation Handling**: Romanian names display, English names used for DB

### **5. Debug Functionality**
- [ ] **Debug Panel**: Debug panel shows relevant information
- [ ] **Debug Logs**: Logs are captured and displayed
- [ ] **Error Tracking**: Errors are logged and visible

## 🎯 **Test URL**
```
http://localhost:3000/admin/voedingsplannen-v3/cmgva5hrq000idyzrog854s0w
```

## 📋 **Test Checklist**

### **Initial Load Test**
1. Navigate to V3 URL
2. Verify page loads without errors
3. Check that plan data is displayed
4. Verify ingredients are parsed correctly
5. Check total macros calculation

### **Add Ingredient Test**
1. Click "Add Ingredient" button
2. Search for an ingredient (e.g., "chicken")
3. Select an ingredient
4. Set quantity and unit
5. Click "Add Ingredient"
6. Verify ingredient appears in list
7. Check macro calculation updates

### **Edit Ingredient Test**
1. Change quantity of existing ingredient
2. Verify macros update in real-time
3. Wait for auto-save (1 second)
4. Refresh page
5. Verify changes persisted

### **Remove Ingredient Test**
1. Click "×" button on an ingredient
2. Verify ingredient is removed
3. Check macro calculation updates
4. Refresh page
5. Verify removal persisted

### **Debug Test**
1. Click "🐛 Debug" button
2. Verify debug panel opens
3. Check debug logs are displayed
4. Perform some actions
5. Verify logs are updated

## 🚨 **Known Issues to Watch For**
- Double scaling of macros
- State inconsistencies after refresh
- Ingredient matching failures
- Auto-save not working
- UI not updating after changes

## ✅ **Success Criteria**
- All test scenarios pass
- No console errors
- Smooth user experience
- Reliable data persistence
- Accurate macro calculations

