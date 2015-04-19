---
title: "Custom options rendering/templating on Magento"
published: true
date: 06/13/2014 11:00pm
taxonomy:
    category: blog
    tag: [magento]
---

Overriding custom options rendering in Magento is like being dropped off into somewhere in the desert without a map. Let me guide you into this process !

===

**Our objective** : Customize the rendering of a Magento product custom option. 

For example, we're going to customize a classic select field into clickable images.

**prerequisites** : Having a loaded module. Mine is `Nls_Catalog`. 

###1. Add a new product custom option type to the backend

Create a new module or open an existing module config file and add the catalog/product/options block:

    <global>
      ...
      <catalog>
        <product>
          <options>
            <custom>
              <groups>
                <engravingstyle translate="label" module="nls_catalog">
                  <label>Engraving</label><render>nls_catalog/adminhtml_catalog_product_edit_tab_options_type_engravingstyle</render> 
                  <types>
                    <engravingstyle translate="label" module="nls_catalog">
                      <label>Engraving style</label>
                    </engravingstyle>
                  </types>
              </groups>
            </custom>
          </options>
        </product>
      </catalog>
      ...
    </global>
    
To avoid any "magento-looking-the-wrong-block" problems, tag the group the same as the type.
    
In our case, we want to have the same behaviour in the backend than a select option. To do so, we're just going to extend the Magento Select Type. Create the corresponding type :

    <?php
    
    class Nls_Catalog_Block_Adminhtml_Catalog_Product_Edit_Tab_Options_Type_Engravingstyle 
    extends Mage_Adminhtml_Block_Catalog_Product_Edit_Tab_Options_Type_Select
    {
    
    }

It should be located into `app/code/local/Nls/Catalog/Block/Adminhtml/Catalog/Product/Edit/Tab/Options/Type/Engravingstyle.php`.

The next step is to override Magento Options Tab to include our type. That's an ugly override but it's the only way to add our type to the template.

Create the file : It should be located into `app/code/local/Nls/Catalog/Block/Adminhtml/Catalog/Product/Edit/Tab/Options/Option.php`. Add this class content inside : 

    <?php

    class Nls_Catalog_Block_Adminhtml_Catalog_Product_Edit_Tab_Options_Option 
    extends Mage_Adminhtml_Block_Catalog_Product_Edit_Tab_Options_Option
    {
        /**
         * Class constructor
         */
        public function __construct()
        {
          parent::__construct();
          $this->setTemplate('nls_catalog/product/edit/options/option.phtml');
        }
    }
    
Create now the template file associated to the previous block by copying  `app/design/adminhtml/default/default/catalog/product/edit/options/option.phtml` into `app/design/adminhtml/default/default/nls_catalog/product/edit/options/option.phtml`. We could have created a new adminhtml theme but in this case we would had to copy the entire adminhtml folder ...

Edit the newly created `option.phtml` and add your type wherever the select type is used in a switch :

    switch(element.getValue()){
        case 'drop_down':
          case 'radio':
          case 'checkbox':
          case 'multiple':
          case 'engravingstyle':
          case 'ringsize':
            selectOptionType.bindAddButton();
              break;
    }

You should normally add it 4 times in this files.

Go into the **Custom options** tab of any product. You should have a new option type in the select drop-down.

![magento_custom_type](http://static.nls.io/blog/magento_custom_type.png)

Create that test option now !

###2. Create a front-end renderer

The first step is to override the way Magento find the correct block to output your option. That's a bit ugly too but skiing this step forces us to create a complete new type without overriding any existent. Such  pain for a very little gain.

Copy `app/code/core/Mage/Catalog/Block/Product/View/Options.php` into the file `app/code/local/Nls/Catalog/Block/Product/View/Options.php` and modify the class name. Add and if condition on your type :

    <?php
    class Nls_Catalog_Block_Product_View_Options extends Mage_Catalog_Block_Product_View_Options
    {
      /**
       * Get option html block
       *
       * @param Mage_Catalog_Model_Product_Option $option
       */
      public function getOptionHtml(Mage_Catalog_Model_Product_Option $option)
      {
        if($option->getType() == 'engravingstyle') {
          $renderer = $this->getOptionRender('engravingstyle');
        }
        else {
          $renderer = $this->getOptionRender(
            $this->getGroupOfOption($option->getType())
          );
        }

        if (is_null($renderer['renderer'])) {
          $renderer['renderer'] = $this->getLayout()->createBlock($renderer['block'])
            ->setTemplate($renderer['template']);
        }
        return $renderer['renderer']
          ->setProduct($this->getProduct())
          ->setOption($option)
          ->toHtml();
      }
    }

In order to have Magento using this class, we must rewrite the original in your config.xml :

    <config>
      <global>
          ...
        <models>
          <catalog>
            <rewrite>
              <product_option>Nls_Catalog_Model_Product_Option</product_option>
            </rewrite>
          </catalog>
        </models>
          ...
      </global>
    </config>


Make sure you have overrided the `catalog.xml` layout file into your module.
Open it and find the `product.info.options` block.

Add the new OptionRender action into the layout file :

    <action method="addOptionRenderer">
      <type>engravingstyle</type>
        <block>nls_catalog/product_view_options_type_engravingstyle</block>
        <template>catalog/product/view/options/type/engravingstyle.phtml</template>
    </action>
    
Create the matching block. In my case : `app/code/local/Nls/Catalog/Block/Product/View/Options/Type/Engravingstyle.php`.

    <?php 
    class Nls_Catalog_Block_Product_View_Options_Type_Engravingstyle extends  Mage_Catalog_Block_Product_View_Options_Abstract
    {
        protected $_template = 'catalog/product/view/options/type/engravingstyle.phtml';

        public function __contruct(){
          parent::__construct();
        }
    }

Create the template file linked to this block : `app/design/frontend/<package>/<theme>/catalog/product/view/options/type/engravingstyle.phtml`

Add the following content :

    <?php $_option = $this->getOption(); ?>
    <dt><label<?php if ($_option->getIsRequire()) echo ' class="required"' ?>><?php if ($_option->getIsRequire()) echo '<em>*</em>' ?><?php echo  $this->htmlEscape($_option->getTitle()) ?></label>
        <?php echo $this->getFormatedPrice() ?></dt>
    <dd<?php if ($_option->decoratedIsLast){?> class="last"<?php }?>>
        <ul>
          <?php foreach ($_option->getValues() as $o => $value) : ?>
            <li class="<?php echo strtolower(str_replace(' ', '_', $value->getTitle())); ?>">
            <?php echo $this->__($value->getTitle()); ?>
            </li>
          <?php endforeach; ?>
      </ul>
    </dd>

**You should now have a nice `ul>li` on your product page for this option !**